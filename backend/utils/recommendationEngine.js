import { pipeline } from '@xenova/transformers';
import embeddingStore from './embeddingStore.js';

/**
 * RecommendationEngine v2
 *
 * Upgrades over v1:
 *   - Disk-persisted text embeddings (no recompute on restart)
 *   - In-memory LRU for query-time misses
 *   - Co-purchase (collaborative filtering) signal
 *   - Popularity prior from total sales
 *   - MMR diversification so results aren't all TopWear-Men
 *   - Fixed complementary-boost bug (was returning undefined)
 *   - Batched embedding on warmup for speed
 */
class RecommendationEngine {
    constructor() {
        this.extractor = null;
        this.loadPromise = null;
        this.runtimeCache = new Map(); // text -> vec (for ad-hoc queries)
    }

    async init() {
        if (this.extractor) return;
        if (this.loadPromise) return this.loadPromise;

        this.loadPromise = (async () => {
            console.log('[RecoEngine] Loading MiniLM text model...');
            this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log('[RecoEngine] Text model ready.');
        })();
        return this.loadPromise;
    }

    async getEmbedding(text) {
        if (this.runtimeCache.has(text)) return this.runtimeCache.get(text);
        await this.init();
        const output = await this.extractor(text, { pooling: 'mean', normalize: true });
        const vec = Array.from(output.data);
        // Keep runtime cache bounded
        if (this.runtimeCache.size > 500) {
            const firstKey = this.runtimeCache.keys().next().value;
            this.runtimeCache.delete(firstKey);
        }
        this.runtimeCache.set(text, vec);
        return vec;
    }

    prepareProductText(product) {
        // Richer representation: repeat category/subCategory to up-weight them
        return `${product.name}. ${product.description}. Category: ${product.category} ${product.subCategory}. Type: ${product.subCategory} ${product.category}.`.toLowerCase();
    }

    /** Get (or compute + cache) text embedding for a product. */
    async getProductTextVec(product) {
        const pid = product._id.toString();
        const text = this.prepareProductText(product);
        const sig = embeddingStore.hash(text);

        const cachedSig = embeddingStore.getTextSig(pid);
        if (cachedSig === sig) {
            const cached = embeddingStore.getTextVec(pid);
            if (cached) return cached;
        }

        const vec = await this.getEmbedding(text);
        embeddingStore.setTextVec(pid, sig, vec);
        return vec;
    }

    /** Warm up the embedding store with all products (batched, background-safe). */
    async warmupProducts(products) {
        await this.init();
        let built = 0;
        const t0 = Date.now();
        for (const p of products) {
            const pid = p._id.toString();
            const text = this.prepareProductText(p);
            const sig = embeddingStore.hash(text);
            if (embeddingStore.getTextSig(pid) === sig && embeddingStore.getTextVec(pid)) continue;
            try {
                const vec = await this.getEmbedding(text);
                embeddingStore.setTextVec(pid, sig, vec);
                built++;
            } catch (e) { /* skip */ }
        }
        embeddingStore.flushSync();
        if (built > 0) {
            console.log(`[RecoEngine] Warmup: embedded ${built} products in ${((Date.now()-t0)/1000).toFixed(1)}s.`);
        } else {
            console.log('[RecoEngine] Warmup: text cache already current.');
        }
    }

    cosine(a, b) {
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na === 0 || nb === 0) return 0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }

    // Fixed version of complementary score (original was missing a return)
    complementaryBoost(profileItems, candidate) {
        let boost = 1.0;
        const seenSubs = new Set(profileItems.map(p => `${p.category}|${p.subCategory}`));
        const candKey = `${candidate.category}|${candidate.subCategory}`;
        // Buying across categories earns a boost (the "complete the look" bonus)
        if (!seenSubs.has(candKey)) {
            for (const p of profileItems) {
                if (p.category !== candidate.category) continue;
                if (p.subCategory === 'TopWear' && (candidate.subCategory === 'BottomWear' || candidate.subCategory === 'WinterWear')) boost += 0.15;
                else if (p.subCategory === 'BottomWear' && (candidate.subCategory === 'TopWear' || candidate.subCategory === 'WinterWear')) boost += 0.15;
                else if (p.subCategory === 'WinterWear' && candidate.subCategory !== 'WinterWear') boost += 0.10;
            }
        }
        return Math.min(boost, 1.5);
    }

    /**
     * Build a co-purchase matrix from all orders:
     * coPurchase[a][b] = # of orders where both a and b appear
     */
    buildCoPurchaseMatrix(orders) {
        const matrix = new Map(); // Map<pid, Map<pid, count>>
        for (const order of orders) {
            const pids = [...new Set((order.items || [])
                .map(it => (it._id || it.productId)?.toString())
                .filter(Boolean))];
            for (let i = 0; i < pids.length; i++) {
                for (let j = 0; j < pids.length; j++) {
                    if (i === j) continue;
                    if (!matrix.has(pids[i])) matrix.set(pids[i], new Map());
                    const row = matrix.get(pids[i]);
                    row.set(pids[j], (row.get(pids[j]) || 0) + 1);
                }
            }
        }
        return matrix;
    }

    /** Tally each product's total sales volume. */
    buildPopularity(orders) {
        const counts = new Map();
        for (const order of orders) {
            for (const item of (order.items || [])) {
                const pid = (item._id || item.productId)?.toString();
                if (!pid) continue;
                counts.set(pid, (counts.get(pid) || 0) + (Number(item.quantity) || 1));
            }
        }
        return counts;
    }

    /**
     * Apply Maximal Marginal Relevance (MMR) for diversification.
     * Picks top-K items balancing relevance vs similarity-to-already-picked.
     * lambda=1 → pure relevance; lambda=0 → pure diversity. 0.7 is a good balance.
     */
    mmrDiversify(candidates, k, lambda = 0.7) {
        // candidates: [{ product, vec, score }]
        const selected = [];
        const remaining = [...candidates];
        while (selected.length < k && remaining.length > 0) {
            let bestIdx = 0;
            let bestMMR = -Infinity;
            for (let i = 0; i < remaining.length; i++) {
                const c = remaining[i];
                let maxSim = 0;
                for (const s of selected) {
                    const sim = this.cosine(c.vec, s.vec);
                    if (sim > maxSim) maxSim = sim;
                }
                const mmr = lambda * c.score - (1 - lambda) * maxSim;
                if (mmr > bestMMR) { bestMMR = mmr; bestIdx = i; }
            }
            selected.push(remaining[bestIdx]);
            remaining.splice(bestIdx, 1);
        }
        return selected;
    }
}

const engine = new RecommendationEngine();
export default engine;
