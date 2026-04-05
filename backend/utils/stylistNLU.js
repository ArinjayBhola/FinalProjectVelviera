/**
 * StylistNLU — rule-based Natural Language Understanding for the Velvi stylist.
 *
 * Runs entirely offline. No LLM, no API keys, no rate limits.
 * Extracts structured slots from free-form user messages:
 *   - intent (greet | search | refine | outfit | compare | size_help | thanks | help)
 *   - budget (max rupees)
 *   - occasion (wedding, party, office, ...)
 *   - category (Men | Women)
 *   - subCategory (TopWear | BottomWear | WinterWear)
 *   - styles (slim, oversized, formal, minimal, ...)
 *   - colors
 *   - sizes (S | M | L | XL | XXL)
 *   - productTerms (raw keywords for semantic retrieval)
 */

// Keyword dictionaries ---------------------------------------------------------

const GENDER_MAP = {
    men: 'Men', mens: 'Men', man: 'Men', male: 'Men', guy: 'Men', guys: 'Men',
    boys: 'Men', boy: 'Men', gents: 'Men', him: 'Men', husband: 'Men', bf: 'Men', boyfriend: 'Men',
    women: 'Women', womens: 'Women', woman: 'Women', female: 'Women', ladies: 'Women', lady: 'Women',
    girl: 'Women', girls: 'Women', her: 'Women', wife: 'Women', gf: 'Women', girlfriend: 'Women'
};

// Map loose user terms to your schema's subCategory enum
const SUBCATEGORY_MAP = {
    // TopWear
    shirt: 'TopWear', shirts: 'TopWear',
    tshirt: 'TopWear', 'tshirts': 'TopWear', 't-shirt': 'TopWear', 'tee': 'TopWear', tees: 'TopWear',
    top: 'TopWear', tops: 'TopWear', blouse: 'TopWear', kurta: 'TopWear', kurti: 'TopWear',
    polo: 'TopWear', crop: 'TopWear', 'crop-top': 'TopWear',
    // BottomWear
    jeans: 'BottomWear', jean: 'BottomWear', pants: 'BottomWear', pant: 'BottomWear',
    trouser: 'BottomWear', trousers: 'BottomWear', shorts: 'BottomWear', short: 'BottomWear',
    skirt: 'BottomWear', skirts: 'BottomWear', joggers: 'BottomWear', jogger: 'BottomWear',
    chinos: 'BottomWear', cargo: 'BottomWear', cargos: 'BottomWear',
    // WinterWear
    jacket: 'WinterWear', jackets: 'WinterWear', hoodie: 'WinterWear', hoodies: 'WinterWear',
    sweater: 'WinterWear', sweaters: 'WinterWear', sweatshirt: 'WinterWear', sweatshirts: 'WinterWear',
    coat: 'WinterWear', coats: 'WinterWear', blazer: 'WinterWear', blazers: 'WinterWear',
    pullover: 'WinterWear', cardigan: 'WinterWear'
};

const OCCASIONS = [
    'wedding', 'party', 'office', 'work', 'casual', 'date', 'dinner', 'festival',
    'festive', 'workout', 'gym', 'travel', 'beach', 'interview', 'brunch', 'formal',
    'diwali', 'holi', 'eid', 'christmas', 'birthday', 'concert', 'college', 'weekend',
    'vacation', 'meeting', 'lounge', 'loungewear', 'sleep', 'sleepwear'
];

const STYLES = [
    'slim', 'loose', 'oversized', 'regular', 'relaxed', 'fitted', 'tight',
    'formal', 'casual', 'streetwear', 'street', 'minimal', 'minimalist', 'trendy',
    'vintage', 'retro', 'classic', 'basic', 'premium', 'luxury', 'sporty', 'athleisure',
    'ethnic', 'traditional', 'modern', 'boho', 'bohemian', 'smart-casual', 'smart',
    'edgy', 'chic', 'elegant', 'comfortable', 'comfy', 'cool', 'stylish'
];

const COLORS = [
    'black', 'white', 'red', 'blue', 'navy', 'green', 'olive', 'yellow', 'orange',
    'pink', 'purple', 'violet', 'grey', 'gray', 'brown', 'beige', 'cream', 'ivory',
    'maroon', 'burgundy', 'khaki', 'tan', 'gold', 'silver', 'teal', 'turquoise',
    'mustard', 'lavender', 'peach', 'coral', 'mint', 'denim', 'pastel', 'neon'
];

const SIZES = ['xxs', 'xs', 's', 'small', 'm', 'medium', 'l', 'large', 'xl', 'xxl', 'xxxl'];
const SIZE_NORMALIZE = {
    xxs: 'XXS', xs: 'XS', s: 'S', small: 'S', m: 'M', medium: 'M',
    l: 'L', large: 'L', xl: 'XL', xxl: 'XXL', xxxl: 'XXXL'
};

// Intent regex / keyword patterns
const GREET_RE = /\b(hi|hello|hey|yo|hola|sup|namaste|greetings)\b/i;
const THANKS_RE = /\b(thanks|thank you|thx|ty|appreciate|great|awesome|perfect|cool)\b/i;
const HELP_RE = /\b(help|how (do|can) i|what can you|who are you|what are you)\b/i;
const OUTFIT_RE = /\b(outfit|look|complete the look|styled|style me|full look|head to toe|fit check)\b/i;
const COMPARE_RE = /\b(compare|difference|vs|better|which one)\b/i;
const SIZE_RE = /\b(size|fit|too (big|small|tight|loose)|what size)\b/i;
const CHEAPER_RE = /\b(cheaper|less|lower (budget|price)|under\s*\d|below|affordable)\b/i;
const REFINE_RE = /\b(more|show (me )?(more|other|different|another)|other options|different|swap|change|instead|not (these|this|that))\b/i;

// Extractors -------------------------------------------------------------------

function extractBudget(text) {
    // ₹3000, rs 3k, under 3000, below 2500, around 1500, between 1000 and 2000
    const t = text.toLowerCase();

    // Range: between X and Y
    const range = t.match(/between\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k?\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k?/);
    if (range) {
        const lo = parseFloat(range[1]) * (t.includes(range[1] + 'k') || /between\s*\d+k/.test(t) ? 1000 : 1);
        const hi = parseFloat(range[2]) * (t.includes(range[2] + 'k') ? 1000 : 1);
        return { min: Math.min(lo, hi), max: Math.max(lo, hi) };
    }

    // Upper bound: under X, below X, less than X, within X
    const upper = t.match(/(?:under|below|less than|within|upto|up to|max|maximum|at most)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k)?/);
    if (upper) {
        const val = parseFloat(upper[1]) * (upper[2] ? 1000 : 1);
        return { max: val };
    }

    // "around X" / "about X" → ±20%
    const around = t.match(/(?:around|about|roughly|approximately|near|nearly)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k)?/);
    if (around) {
        const val = parseFloat(around[1]) * (around[2] ? 1000 : 1);
        return { min: Math.floor(val * 0.8), max: Math.ceil(val * 1.2) };
    }

    // Lower bound: over X, above X, more than X
    const lower = t.match(/(?:over|above|more than|at least|min|minimum)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k)?/);
    if (lower) {
        const val = parseFloat(lower[1]) * (lower[2] ? 1000 : 1);
        return { min: val };
    }

    // Bare number with currency prefix: ₹3000, rs 2500, inr 1200
    const bare = t.match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)\s*(k)?/);
    if (bare) {
        const val = parseFloat(bare[1]) * (bare[2] ? 1000 : 1);
        return { max: val };
    }

    // Just "3k" with budget context word
    const kOnly = t.match(/\bbudget\s*(?:is|of)?\s*(\d+(?:\.\d+)?)\s*(k)?/);
    if (kOnly) {
        const val = parseFloat(kOnly[1]) * (kOnly[2] ? 1000 : 1);
        return { max: val };
    }

    return null;
}

function extractKeywords(text, dict) {
    const t = ` ${text.toLowerCase()} `;
    const found = new Set();
    for (const word of dict) {
        // Word boundary check (handles multi-word like 'crop-top')
        const pattern = new RegExp(`[\\s,.!?'"\\-]${word.replace(/[-]/g, '[\\s\\-]?')}[\\s,.!?'"\\-]`, 'i');
        if (pattern.test(t)) found.add(word);
    }
    return [...found];
}

function extractFromMap(text, map) {
    const t = ` ${text.toLowerCase()} `;
    const matches = new Set();
    for (const key of Object.keys(map)) {
        const pattern = new RegExp(`[\\s,.!?'"\\-]${key}[\\s,.!?'"\\-]`, 'i');
        if (pattern.test(t)) matches.add(map[key]);
    }
    return [...matches];
}

function extractSizes(text) {
    const t = text.toLowerCase();
    const found = new Set();
    for (const s of SIZES) {
        // For single-letter sizes, require word boundary
        const pattern = s.length <= 2
            ? new RegExp(`\\bsize\\s+${s}\\b|\\b${s}\\s*(?:size|fit)\\b`, 'i')
            : new RegExp(`\\b${s}\\b`, 'i');
        if (pattern.test(t)) found.add(SIZE_NORMALIZE[s]);
    }
    return [...found];
}

function extractIntent(text) {
    if (OUTFIT_RE.test(text)) return 'outfit';
    if (COMPARE_RE.test(text)) return 'compare';
    if (SIZE_RE.test(text) && !/\b(s|m|l|xl)\s*(size|fit)\b/i.test(text)) return 'size_help';
    if (CHEAPER_RE.test(text)) return 'refine';
    if (REFINE_RE.test(text)) return 'refine';
    if (HELP_RE.test(text)) return 'help';
    if (THANKS_RE.test(text) && text.trim().split(/\s+/).length <= 4) return 'thanks';
    if (GREET_RE.test(text) && text.trim().split(/\s+/).length <= 4) return 'greet';
    return 'search';
}

// Extract "noisy" content words from the message for semantic retrieval
function extractProductTerms(text) {
    const stop = new Set([
        'i', 'me', 'my', 'we', 'you', 'your', 'a', 'an', 'the', 'is', 'are', 'was', 'were',
        'for', 'to', 'of', 'in', 'on', 'at', 'with', 'and', 'or', 'but', 'so', 'if',
        'show', 'want', 'need', 'looking', 'find', 'get', 'buy', 'some', 'any', 'this', 'that',
        'these', 'those', 'please', 'can', 'could', 'would', 'should', 'have', 'has', 'do', 'does',
        'under', 'below', 'over', 'above', 'around', 'about', 'between', 'rs', 'inr', 'budget',
        'wear', 'piece', 'pieces', 'item', 'items', 'thing', 'things', 'something', 'anything',
        'me', 'hey', 'hi', 'hello', 'thanks'
    ]);
    return text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stop.has(w) && !/^\d+k?$/.test(w));
}

// Main entry point -------------------------------------------------------------

export function parseMessage(text) {
    const cleaned = (text || '').trim();
    if (!cleaned) {
        return { intent: 'greet', slots: {}, raw: '' };
    }

    const intent = extractIntent(cleaned);
    const budget = extractBudget(cleaned);
    const categories = extractFromMap(cleaned, GENDER_MAP);
    const subCategories = extractFromMap(cleaned, SUBCATEGORY_MAP);
    const occasions = extractKeywords(cleaned, OCCASIONS);
    const styles = extractKeywords(cleaned, STYLES);
    const colors = extractKeywords(cleaned, COLORS);
    const sizes = extractSizes(cleaned);
    const productTerms = extractProductTerms(cleaned);

    return {
        intent,
        raw: cleaned,
        slots: {
            budget,
            category: categories[0] || null,
            subCategory: subCategories[0] || null,
            occasions,
            styles,
            colors,
            sizes,
            productTerms
        }
    };
}

/**
 * Merge new slots onto an existing session slot-set.
 * Explicit new values overwrite; empty ones keep prior state (sticky memory).
 * Exception: if user says "reset" / "start over", caller should clear first.
 */
export function mergeSlots(prior, next) {
    const merged = { ...prior };
    if (next.budget) merged.budget = next.budget;
    if (next.category) merged.category = next.category;
    if (next.subCategory) merged.subCategory = next.subCategory;
    if (next.occasions?.length) merged.occasions = next.occasions;
    if (next.styles?.length) merged.styles = next.styles;
    if (next.colors?.length) merged.colors = next.colors;
    if (next.sizes?.length) merged.sizes = next.sizes;
    if (next.productTerms?.length) {
        // accumulate product terms across turns (bounded)
        const prev = prior.productTerms || [];
        merged.productTerms = [...new Set([...prev, ...next.productTerms])].slice(-12);
    }
    return merged;
}

export function isResetRequest(text) {
    return /\b(reset|start over|clear|forget|new search|fresh)\b/i.test(text || '');
}

export default { parseMessage, mergeSlots, isResetRequest };
