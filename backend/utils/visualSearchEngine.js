import { pipeline, RawImage } from '@xenova/transformers';

/**
 * Visual Search engine using CLIP (vision) embeddings.
 * - Lazily loads the CLIP vision model
 * - Caches product image embeddings by product id + image url
 * - Exposes embedImageFromUrl / embedImageFromBuffer / cosineSimilarity
 */
class VisualSearchEngine {
    constructor() {
        this.extractor = null;
        this.loadPromise = null;
        // Map<productId, { url, vector }>
        this.productCache = new Map();
    }

    async init() {
        if (this.extractor) return;
        if (this.loadPromise) return this.loadPromise;

        this.loadPromise = (async () => {
            console.log('Loading CLIP visual-search model...');
            // CLIP vision encoder - produces 512-d image embeddings
            this.extractor = await pipeline(
                'image-feature-extraction',
                'Xenova/clip-vit-base-patch32'
            );
            console.log('CLIP model loaded.');
        })();
        return this.loadPromise;
    }

    async embedImageFromUrl(url) {
        await this.init();
        const image = await RawImage.fromURL(url);
        const output = await this.extractor(image);
        return Array.from(output.data);
    }

    async embedImageFromBuffer(buffer) {
        await this.init();
        // RawImage.read accepts a Blob or a URL — wrap the buffer in a Blob
        const blob = new Blob([buffer]);
        const image = await RawImage.fromBlob(blob);
        const output = await this.extractor(image);
        return Array.from(output.data);
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

    async getProductEmbedding(product) {
        const url = product.image1;
        if (!url) return null;
        const cached = this.productCache.get(product._id.toString());
        if (cached && cached.url === url) return cached.vector;

        try {
            const vector = await this.embedImageFromUrl(url);
            this.productCache.set(product._id.toString(), { url, vector });
            return vector;
        } catch (e) {
            console.log('embed product image failed:', product._id?.toString(), e.message);
            return null;
        }
    }
}

const visualSearchEngine = new VisualSearchEngine();
export default visualSearchEngine;
