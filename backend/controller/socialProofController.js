import Product from "../model/productModel.js";
import Order from "../model/orderModel.js";

/**
 * In-memory session tracker for "X people viewing" live counter.
 * productViewers: Map<productId, Map<sessionId, lastSeenMs>>
 * Entries expire after VIEWER_TTL without a heartbeat.
 */
const VIEWER_TTL = 60 * 1000; // 60s
const productViewers = new Map();

const cleanupViewers = (productId) => {
    const now = Date.now();
    const sessions = productViewers.get(productId);
    if (!sessions) return 0;
    for (const [sid, ts] of sessions.entries()) {
        if (now - ts > VIEWER_TTL) sessions.delete(sid);
    }
    if (sessions.size === 0) productViewers.delete(productId);
    return sessions.size;
};

/**
 * Heartbeat: register/refresh a viewer session for a product.
 * Returns current live viewer count for that product.
 * The client should call this every ~30s while on the product page.
 */
export const heartbeatViewer = async (req, res) => {
    try {
        const { productId, sessionId } = req.body;
        if (!productId || !sessionId) {
            return res.status(400).json({ message: "productId and sessionId required" });
        }
        if (!productViewers.has(productId)) productViewers.set(productId, new Map());
        productViewers.get(productId).set(sessionId, Date.now());
        const count = cleanupViewers(productId);
        return res.status(200).json({ count });
    } catch (error) {
        console.log("heartbeatViewer error", error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Return aggregated social proof for a given product:
 *  - live viewer count
 *  - recent purchase count (last 7 days)
 *  - total units sold
 *  - reviews annotated with verifiedBuyer flag
 */
export const getSocialProof = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const liveViewers = cleanupViewers(productId);

        // Find all orders that contain this product
        const orders = await Order.find({});
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        let recentPurchases = 0;
        let totalSold = 0;
        const buyerUserIds = new Set();

        for (const order of orders) {
            const hasProduct = (order.items || []).some(it => {
                const pid = (it._id || it.productId)?.toString();
                return pid === productId.toString();
            });
            if (!hasProduct) continue;

            buyerUserIds.add(order.userId.toString());
            const qty = (order.items || [])
                .filter(it => ((it._id || it.productId)?.toString()) === productId.toString())
                .reduce((s, it) => s + (Number(it.quantity) || 1), 0);
            totalSold += qty;
            if (order.date >= sevenDaysAgo) recentPurchases += qty;
        }

        // Annotate reviews with verifiedBuyer flag
        const reviewsWithVerified = (product.reviews || []).map(r => ({
            ...(r.toObject ? r.toObject() : r),
            verifiedBuyer: buyerUserIds.has(r.userId.toString())
        }));

        return res.status(200).json({
            liveViewers,
            recentPurchases,
            totalSold,
            reviews: reviewsWithVerified
        });
    } catch (error) {
        console.log("getSocialProof error", error);
        return res.status(500).json({ message: error.message });
    }
};

