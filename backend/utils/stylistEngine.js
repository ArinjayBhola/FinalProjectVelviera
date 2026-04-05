/**
 * StylistEngine — query building + product retrieval + outfit assembly.
 *
 * Uses the existing MiniLM text embeddings (via recommendationEngine) for
 * semantic matching, layered with rule-based hard filters and soft boosts
 * derived from the parsed user slots.
 */

import recommendationEngine from './recommendationEngine.js';

// Occasion → style hints that bias retrieval toward relevant products
const OCCASION_HINTS = {
    wedding: ['formal', 'ethnic', 'elegant', 'party'],
    party: ['party', 'trendy', 'stylish', 'statement'],
    office: ['formal', 'smart', 'work', 'professional'],
    work: ['formal', 'smart', 'work', 'professional'],
    casual: ['casual', 'everyday', 'relaxed'],
    date: ['trendy', 'stylish', 'elegant'],
    dinner: ['smart', 'elegant', 'semi-formal'],
    festival: ['ethnic', 'festive', 'traditional'],
    festive: ['ethnic', 'festive', 'traditional'],
    diwali: ['ethnic', 'festive', 'traditional'],
    holi: ['casual', 'bright', 'festive'],
    eid: ['ethnic', 'festive', 'traditional'],
    workout: ['sport', 'athletic', 'gym', 'activewear'],
    gym: ['sport', 'athletic', 'gym', 'activewear'],
    travel: ['comfortable', 'casual', 'versatile'],
    beach: ['light', 'summer', 'casual', 'vacation'],
    interview: ['formal', 'professional', 'smart'],
    brunch: ['casual', 'chic', 'trendy'],
    formal: ['formal', 'smart', 'professional'],
    college: ['casual', 'trendy', 'streetwear'],
    weekend: ['casual', 'relaxed', 'comfortable'],
    vacation: ['summer', 'casual', 'travel'],
    lounge: ['comfortable', 'relaxed', 'loungewear'],
    loungewear: ['comfortable', 'relaxed', 'loungewear']
};

function buildQueryText(slots) {
    const parts = [];
    if (slots.occasions?.length) {
        parts.push(`for ${slots.occasions.join(' and ')}`);
        for (const occ of slots.occasions) {
            const hints = OCCASION_HINTS[occ];
            if (hints) parts.push(...hints);
        }
    }
    if (slots.styles?.length) parts.push(...slots.styles);
    if (slots.colors?.length) parts.push(...slots.colors);
    if (slots.subCategory) {
        const pretty = slots.subCategory.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
        parts.push(pretty);
    }
    if (slots.category) parts.push(slots.category.toLowerCase());
    if (slots.productTerms?.length) parts.push(...slots.productTerms);
    return parts.join(' ').trim() || 'clothing apparel fashion';
}

function matchesHardFilters(product, slots) {
    // Stock
    if ((product.stock ?? 1) <= 0) return false;

    // Gender / category
    if (slots.category && product.category !== slots.category) return false;

    // Subcategory (only enforce as a preference, not hard filter, unless explicit)
    if (slots.subCategory && product.subCategory !== slots.subCategory) {
        // keep as soft: we'll penalize in scoring
    }

    // Budget
    if (slots.budget?.max != null && product.price > slots.budget.max) return false;
    if (slots.budget?.min != null && product.price < slots.budget.min) return false;

    // Size availability
    if (slots.sizes?.length) {
        const productSizes = (product.sizes || []).map(s => String(s).toUpperCase());
        const wanted = slots.sizes.map(s => s.toUpperCase());
        const hasAny = wanted.some(w => productSizes.includes(w));
        if (!hasAny) return false;
    }

    return true;
}

function computeSoftBoost(product, slots) {
    let boost = 1.0;
    const text = `${product.name} ${product.description}`.toLowerCase();

    // SubCategory soft match (not strictly filtered)
    if (slots.subCategory && product.subCategory === slots.subCategory) boost *= 1.20;

    // Color mention in name/description
    if (slots.colors?.length) {
        const colorHits = slots.colors.filter(c => text.includes(c)).length;
        if (colorHits > 0) boost *= (1 + 0.12 * colorHits);
    }

    // Style mention
    if (slots.styles?.length) {
        const styleHits = slots.styles.filter(s => text.includes(s)).length;
        if (styleHits > 0) boost *= (1 + 0.08 * styleHits);
    }

    // Occasion hint mention
    if (slots.occasions?.length) {
        let occHits = 0;
        for (const occ of slots.occasions) {
            if (text.includes(occ)) occHits += 2;
            const hints = OCCASION_HINTS[occ] || [];
            for (const h of hints) if (text.includes(h)) occHits += 1;
        }
        if (occHits > 0) boost *= (1 + 0.05 * Math.min(occHits, 4));
    }

    // Bestseller mild tiebreaker
    if (product.bestseller) boost *= 1.03;

    // Freshness
    const ageDays = (Date.now() - product.date) / (24 * 60 * 60 * 1000);
    if (ageDays < 21) boost *= 1.04;

    return boost;
}

/**
 * Retrieve the top-K products matching the user's current slot-set.
 */
export async function retrieveProducts(allProducts, slots, k = 6) {
    const queryText = buildQueryText(slots);
    const queryVec = await recommendationEngine.getEmbedding(queryText);

    const candidates = [];
    for (const product of allProducts) {
        if (!matchesHardFilters(product, slots)) continue;
        const vec = await recommendationEngine.getProductTextVec(product);
        const sim = recommendationEngine.cosine(queryVec, vec); // [-1, 1]
        const baseScore = (sim + 1) / 2; // [0, 1]
        const score = baseScore * computeSoftBoost(product, slots);
        candidates.push({ product, vec, score, baseScore });
    }

    candidates.sort((a, b) => b.score - a.score);

    // MMR diversify top 30 → top k so we don't return 6 near-identical shirts
    const pool = candidates.slice(0, 30);
    const diversified = recommendationEngine.mmrDiversify(pool, k, 0.75);

    return diversified.map(d => ({
        product: d.product,
        score: d.score,
        matchScore: Math.round(Math.min(99, Math.max(50, d.baseScore * 100)))
    }));
}

/**
 * Outfit mode — pick an anchor (best match), then fill complementary subcategories.
 */
export async function buildOutfit(allProducts, slots) {
    // Anchor: best match overall (ignoring subCategory preference)
    const anchorSlots = { ...slots, subCategory: null };
    const anchors = await retrieveProducts(allProducts, anchorSlots, 3);
    if (anchors.length === 0) return [];

    const outfit = [anchors[0]];
    const seenSubs = new Set([anchors[0].product.subCategory]);
    const seenIds = new Set([anchors[0].product._id.toString()]);

    // Complementary subcategory priority based on anchor
    const anchorSub = anchors[0].product.subCategory;
    const fillOrder = anchorSub === 'TopWear'
        ? ['BottomWear', 'WinterWear']
        : anchorSub === 'BottomWear'
            ? ['TopWear', 'WinterWear']
            : ['TopWear', 'BottomWear'];

    for (const sub of fillOrder) {
        if (seenSubs.has(sub)) continue;
        const picks = await retrieveProducts(allProducts, { ...slots, subCategory: sub }, 3);
        const first = picks.find(p => !seenIds.has(p.product._id.toString()));
        if (first) {
            outfit.push(first);
            seenSubs.add(sub);
            seenIds.add(first.product._id.toString());
        }
    }

    return outfit;
}

export { buildQueryText };
export default { retrieveProducts, buildOutfit, buildQueryText };
