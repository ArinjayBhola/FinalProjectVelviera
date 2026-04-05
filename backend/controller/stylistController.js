import Product from '../model/productModel.js';
import { parseMessage, mergeSlots, isResetRequest } from '../utils/stylistNLU.js';
import { retrieveProducts, buildOutfit } from '../utils/stylistEngine.js';

/**
 * In-memory session memory.
 * Keyed by sessionId sent from the client (stable per browser tab).
 * TTL: 30 min idle. Entry: { slots, lastSeen, history: [...] }.
 */
const sessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000;

function getSession(sessionId) {
    const now = Date.now();
    // Lazy sweep of stale sessions (bounded work per call)
    if (sessions.size > 200 && Math.random() < 0.05) {
        for (const [sid, entry] of sessions) {
            if (now - entry.lastSeen > SESSION_TTL_MS) sessions.delete(sid);
        }
    }
    let entry = sessions.get(sessionId);
    if (!entry || (now - entry.lastSeen) > SESSION_TTL_MS) {
        entry = { slots: {}, lastSeen: now, turns: 0 };
        sessions.set(sessionId, entry);
    }
    entry.lastSeen = now;
    return entry;
}

// Response builders ----------------------------------------------------------

function slotSummary(slots) {
    const bits = [];
    if (slots.category) bits.push(slots.category);
    if (slots.subCategory) bits.push(slots.subCategory.replace(/([A-Z])/g, ' $1').trim());
    if (slots.occasions?.length) bits.push(`for ${slots.occasions[0]}`);
    if (slots.styles?.length) bits.push(slots.styles.slice(0, 2).join(' + '));
    if (slots.colors?.length) bits.push(slots.colors.slice(0, 2).join('/'));
    if (slots.budget?.max) bits.push(`under ₹${slots.budget.max}`);
    return bits;
}

function greetReply() {
    return {
        message: "Hey! I'm Velvi, your personal stylist. Tell me what you're shopping for — occasion, vibe, budget, anything. I'll pull together picks that actually fit what you want.",
        products: [],
        suggestions: [
            "Wedding outfit under ₹3000",
            "Casual streetwear hoodie",
            "Office formal shirt",
            "Style me a full look"
        ]
    };
}

function helpReply() {
    return {
        message: "I can help you in a few ways: tell me an occasion (wedding, office, party), a vibe (minimal, streetwear, formal), a budget, or just describe what you want. Try 'outfit' for a full look, or ask me to go cheaper / different colors / different style and I'll remember what we talked about.",
        products: [],
        suggestions: [
            "Show me formal shirts under ₹1500",
            "Complete the look",
            "Something in black",
            "Cheaper options"
        ]
    };
}

function thanksReply() {
    return {
        message: "Anytime. Ping me whenever you need another recommendation.",
        products: [],
        suggestions: ["Show me something else", "Complete the look", "Different color"]
    };
}

function noResultsReply(slots) {
    const active = slotSummary(slots);
    const ctx = active.length ? ` for ${active.join(', ')}` : '';
    return {
        message: `Nothing matched${ctx} right now. Want to loosen the budget or try a different style?`,
        products: [],
        suggestions: ["Raise budget", "Different color", "Show me popular picks", "Reset"]
    };
}

function resultsReply(picks, slots, isOutfit) {
    const active = slotSummary(slots);
    const ctx = active.length ? ` (${active.join(' · ')})` : '';
    const headline = isOutfit
        ? `Here's a full look${ctx}. Mix, match, swap anything you don't vibe with.`
        : `Pulled ${picks.length} pick${picks.length === 1 ? '' : 's'}${ctx}. Top match scores ${picks[0].matchScore}.`;
    return {
        message: headline,
        products: picks.map(p => ({
            _id: p.product._id,
            name: p.product.name,
            price: p.product.price,
            image1: p.product.image1,
            category: p.product.category,
            subCategory: p.product.subCategory,
            matchScore: p.matchScore,
            bestseller: p.product.bestseller
        })),
        suggestions: isOutfit
            ? ["Swap the top", "Different color palette", "Cheaper version", "Just the shirt"]
            : ["Complete the look", "Cheaper options", "Different color", "Show more"]
    };
}

// Controller -----------------------------------------------------------------

export const chat = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ message: 'sessionId required' });
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ message: 'message required' });
        }

        const session = getSession(sessionId);

        // Handle explicit reset
        if (isResetRequest(message)) {
            session.slots = {};
            session.turns = 0;
            return res.status(200).json({
                message: "Cleared. What are you looking for?",
                products: [],
                suggestions: ["Wedding outfit", "Casual hoodie", "Office shirt", "Style me"],
                slots: {}
            });
        }

        const parsed = parseMessage(message);
        session.slots = mergeSlots(session.slots, parsed.slots);
        session.turns += 1;

        // Intent routing
        if (parsed.intent === 'greet' && session.turns <= 1) {
            return res.status(200).json({ ...greetReply(), slots: session.slots });
        }
        if (parsed.intent === 'help') {
            return res.status(200).json({ ...helpReply(), slots: session.slots });
        }
        if (parsed.intent === 'thanks') {
            return res.status(200).json({ ...thanksReply(), slots: session.slots });
        }
        if (parsed.intent === 'size_help') {
            return res.status(200).json({
                message: "Size tip: if you're between sizes, go up for tops/jackets (layering room), stay true for bottoms. Want me to filter by a specific size? Just say 'size M' or 'large fit'.",
                products: [],
                suggestions: ["Size M", "Size L", "Show me the product", "Different fit"],
                slots: session.slots
            });
        }

        // For refine / search / outfit / compare — pull products
        const allProducts = await Product.find({}).lean();

        if (parsed.intent === 'outfit') {
            const outfit = await buildOutfit(allProducts, session.slots);
            if (outfit.length === 0) {
                return res.status(200).json({ ...noResultsReply(session.slots), slots: session.slots });
            }
            return res.status(200).json({ ...resultsReply(outfit, session.slots, true), slots: session.slots });
        }

        const picks = await retrieveProducts(allProducts, session.slots, 6);
        if (picks.length === 0) {
            return res.status(200).json({ ...noResultsReply(session.slots), slots: session.slots });
        }
        return res.status(200).json({ ...resultsReply(picks, session.slots, false), slots: session.slots });

    } catch (error) {
        console.log('Stylist chat error', error);
        return res.status(500).json({ message: `Stylist error ${error.message}` });
    }
};

export const resetSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (sessionId) sessions.delete(sessionId);
        return res.status(200).json({ message: 'Session cleared' });
    } catch (error) {
        return res.status(500).json({ message: 'Reset error' });
    }
};
