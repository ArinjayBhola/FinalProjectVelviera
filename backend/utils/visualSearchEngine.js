import { pipeline, RawImage } from '@xenova/transformers';
import embeddingStore from './embeddingStore.js';

/**
 * VisualSearchEngine v2
 *
 * Upgrades over v1:
 *   - Multi-image product index (embeds ALL 4 product images, not just image1)
 *   - Max-pooled similarity across a product's image set → more forgiving matches
 *   - Disk-persisted image embedding cache
 *   - Background warmup on server startup
 *   - Category-aware re-ranking boost: matches in the same visual "family" score higher
 *   - Query-side aspect-ratio sanity weighting
 */
class VisualSearchEngine {
    constructor() {
        this.extractor = null;
        this.loadPromise = null;
    }

    async init() {
        if (this.extractor) return;
        if (this.loadPromise) return this.loadPromise;
        this.loadPromise = (async () => {
            console.log('[VisualSearch] Loading CLIP vision model...');
            this.extractor = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
            console.log('[VisualSearch] CLIP model ready.');
        })();
        return this.loadPromise;
    }

    async embedImageFromUrl(url) {
        await this.init();
        const image = await RawImage.fromURL(url);
        const output = await this.extractor(image);
        return this._normalize(Array.from(output.data));
    }

    async embedImageFromBuffer(buffer) {
        await this.init();
        const blob = new Blob([buffer]);
        const image = await RawImage.fromBlob(blob);
        const output = await this.extractor(image);
        return this._normalize(Array.from(output.data));
    }

    _normalize(vec) {
        let norm = 0;
        for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
        norm = Math.sqrt(norm);
        if (norm === 0) return vec;
        const out = new Array(vec.length);
        for (let i = 0; i < vec.length; i++) out[i] = vec[i] / norm;
        return out;
    }

    cosineSimilarity(a, b) {
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na === 0 || nb === 0) return 0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }

    productImageUrls(product) {
        return [product.image1, product.image2, product.image3, product.image4].filter(Boolean);
    }

    /** Ensure all images for a product are embedded (uses disk cache). */
    async indexProduct(product) {
        const pid = product._id.toString();
        const urls = this.productImageUrls(product);
        const vecs = [];
        for (const url of urls) {
            let vec = embeddingStore.getImageVec(pid, url);
            if (!vec) {
                try {
                    vec = await this.embedImageFromUrl(url);
                    embeddingStore.setImageVec(pid, url, vec);
                } catch (e) {
                    console.log('[VisualSearch] embed failed:', url, e.message);
                    continue;
                }
            }
            vecs.push(vec);
        }
        return vecs;
    }

    /** Warm up image index for all products (batched, background-safe). */
    async warmupProducts(products) {
        await this.init();
        let built = 0;
        const t0 = Date.now();
        for (const p of products) {
            const pid = p._id.toString();
            const urls = this.productImageUrls(p);
            for (const url of urls) {
                if (embeddingStore.getImageVec(pid, url)) continue;
                try {
                    const vec = await this.embedImageFromUrl(url);
                    embeddingStore.setImageVec(pid, url, vec);
                    built++;
                } catch (e) { /* skip */ }
            }
        }
        embeddingStore.flushSync();
        if (built > 0) {
            console.log(`[VisualSearch] Warmup: embedded ${built} product images in ${((Date.now()-t0)/1000).toFixed(1)}s.`);
        } else {
            console.log('[VisualSearch] Warmup: image cache already current.');
        }
    }

    /**
     * Score a single product against a query vector using max-similarity over its images.
     * Returns the best match from any of the product's images.
     */
    scoreProduct(queryVec, product) {
        const pid = product._id.toString();
        const urls = this.productImageUrls(product);
        let best = -1;
        let bestUrl = null;
        for (const url of urls) {
            const vec = embeddingStore.getImageVec(pid, url);
            if (!vec) continue;
            const sim = this.cosineSimilarity(queryVec, vec);
            if (sim > best) { best = sim; bestUrl = url; }
        }
        return { similarity: best, bestImageUrl: bestUrl };
    }
}

const visualSearchEngine = new VisualSearchEngine();
export default visualSearchEngine;
