import { pipeline } from '@xenova/transformers';

class RecommendationEngine {
    constructor() {
        this.extractor = null;
        this.promise = null;
        this.cache = new Map();
    }

    async init() {
        if (this.extractor) return;
        if (this.promise) return this.promise;

        this.promise = (async () => {
            console.log('Loading recommendation model...');
            this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log('Model loaded successfully.');
        })();

        return this.promise;
    }

    async getEmbedding(text) {
        if (this.cache.has(text)) return this.cache.get(text);
        
        await this.init();
        const output = await this.extractor(text, { pooling: 'mean', normalize: true });
        const result = Array.from(output.data);
        
        this.cache.set(text, result);
        return result;
    }

    calculateSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Helper to calculate a "Complementary Score" to boost completing the look
    // e.g. buying TopWear boosts BottomWear in the same category (Men/Women)
    calculateComplementaryScore(profiles, candidate) {
        let boost = 1.0;
        for (const p of profiles) {
            // If they are in the same main category (Men/Women)
            if (p.category === candidate.category) {
                // Complementary boosting: TopWear -> BottomWear/WinterWear
                if (p.subCategory === 'TopWear' && (candidate.subCategory === 'BottomWear' || candidate.subCategory === 'WinterWear')) {
                    boost += 0.2;
                } else if (p.subCategory === 'BottomWear' && (candidate.subCategory === 'TopWear' || candidate.subCategory === 'WinterWear')) {
                    boost += 0.2;
                }
            }
        }
    }

    // Helper to prepare product text for embedding
    prepareProductText(product) {
        return `${product.name} ${product.description} ${product.category} ${product.subCategory}`.toLowerCase();
    }
}

const engine = new RecommendationEngine();
export default engine;
