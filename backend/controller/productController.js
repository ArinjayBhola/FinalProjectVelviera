import uploadOnCloudinary from "../config/cloudinary.js"
import Product from "../model/productModel.js"
import User from "../model/userModel.js"
import Order from "../model/orderModel.js"
import recommendationEngine from "../utils/recommendationEngine.js"
import visualSearchEngine from "../utils/visualSearchEngine.js"
import embeddingStore from "../utils/embeddingStore.js"
import fs from "fs"


export const addProduct = async (req,res) => {
    try {
        let {name,description,price,category,subCategory,sizes,bestseller,stock,lowStockThreshold} = req.body

        let image1 = req.files.image1 && req.files.image1[0] ? await uploadOnCloudinary(req.files.image1[0].path) : "";
        let image2 = req.files.image2 && req.files.image2[0] ? await uploadOnCloudinary(req.files.image2[0].path) : "";
        let image3 = req.files.image3 && req.files.image3[0] ? await uploadOnCloudinary(req.files.image3[0].path) : "";
        let image4 = req.files.image4 && req.files.image4[0] ? await uploadOnCloudinary(req.files.image4[0].path) : "";
        
        let productData = {
            name,
            description,
            price :Number(price),
            category,
            subCategory,
            sizes :JSON.parse(sizes),
            bestseller :bestseller === "true" ? true : false,
            date :Date.now(),
            image1,
            image2,
            image3,
            image4,
            stock: stock !== undefined ? Number(stock) : 20,
            lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5
        }

        const product = await Product.create(productData)

        // Index new product in both engines (fire-and-forget)
        (async () => {
            try {
                await recommendationEngine.getProductTextVec(product);
                await visualSearchEngine.indexProduct(product);
                embeddingStore.flushSync();
            } catch (e) { console.log('[Index] new product failed:', e.message); }
        })();

        return res.status(201).json(product)

    } catch (error) {
          console.log("AddProduct error", error)
          import('fs').then(fs => fs.appendFileSync('error.log', error.stack + '\n'));
    return res.status(500).json({message:`AddProduct error ${error.message}`, error: error.toString()})
    }
    
}


export const listProduct = async (req,res) => {
     
    try {
        const product = await Product.find({});
        return res.status(200).json(product)

    } catch (error) {
        console.log("ListProduct error")
    return res.status(500).json({message:`ListProduct error ${error}`})
    }
}

export const removeProduct = async (req,res) => {
    try {
        let {id} = req.params;

        // Block deletion if the product has any in-flight orders
        const blockingStatuses = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Return Requested', 'Return Approved'];
        const activeOrder = await Order.findOne({
            status: { $in: blockingStatuses },
            $or: [
                { 'items._id': id },
                { 'items.productId': id }
            ]
        }).select('_id status');

        if (activeOrder) {
            return res.status(400).json({
                message: `Cannot remove — product is in an active order (${activeOrder.status}). Complete or cancel those orders first.`
            });
        }

        const product = await Product.findByIdAndDelete(id)
        // Clear cached embeddings for the removed product
        embeddingStore.pruneMissing((await Product.find({}).select('_id')).map(p => p._id));
        return res.status(200).json(product)
    } catch (error) {
        console.log("RemoveProduct error")
    return res.status(500).json({message:`RemoveProduct error ${error}`})
    }

}

export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = req.userId;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify the user has actually purchased this product (delivered orders only)
        const hasPurchased = await Order.findOne({
            userId: userId.toString(),
            status: { $in: ['Delivered', 'Returned'] },
            $or: [
                { 'items._id': productId },
                { 'items.productId': productId }
            ]
        }).select('_id');

        if (!hasPurchased) {
            return res.status(403).json({ message: "Only verified buyers can review this product" });
        }

        // Check if user already reviewed
        const alreadyReviewed = product.reviews.find(r => r.userId.toString() === userId.toString());
        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        const review = {
            userId: userId,
            name: user.name,
            rating: Number(rating),
            comment,
            date: Date.now()
        };

        product.reviews.push(review);
        await product.save();

        return res.status(201).json({ message: "Review added successfully", product });
    } catch (error) {
        console.log("AddReview error", error);
        return res.status(500).json({ message: `AddReview error ${error}` });
    }
};

export const visualSearch = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const buffer = fs.readFileSync(req.file.path);
        const queryVector = await visualSearchEngine.embedImageFromBuffer(buffer);
        try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }

        const allProducts = await Product.find({});

        // Lazy-index any newly-added products that aren't in the cache yet
        // (bounded so the request doesn't hang if many new products)
        const unindexed = allProducts.filter(p => {
            const pid = p._id.toString();
            const urls = visualSearchEngine.productImageUrls(p);
            return urls.length > 0 && !embeddingStore.getImageVec(pid, urls[0]);
        }).slice(0, 5);
        for (const p of unindexed) {
            await visualSearchEngine.indexProduct(p);
        }

        // Stage 1 — score every product using max-similarity across its image set
        const scored = [];
        for (const product of allProducts) {
            const { similarity, bestImageUrl } = visualSearchEngine.scoreProduct(queryVector, product);
            if (similarity < 0) continue;
            scored.push({ product, similarity, bestImageUrl, rawSim: similarity });
        }

        // Stage 2 — category-aware re-ranking
        // Detect dominant (category, subCategory) in the top-K by raw similarity,
        // then boost products from that family. This kills cross-category noise
        // (e.g. prevents bottoms from sneaking into a search for a shirt).
        scored.sort((a, b) => b.similarity - a.similarity);
        const topPool = scored.slice(0, Math.min(8, scored.length));
        const famCounts = new Map();
        for (const s of topPool) {
            const key = `${s.product.category}|${s.product.subCategory}`;
            famCounts.set(key, (famCounts.get(key) || 0) + 1);
        }
        let dominantFamily = null;
        let maxCount = 0;
        for (const [key, count] of famCounts) {
            if (count > maxCount) { maxCount = count; dominantFamily = key; }
        }

        // Apply re-ranking boost if there's a clear winner (>=50% of top pool)
        if (dominantFamily && maxCount >= Math.max(3, Math.ceil(topPool.length * 0.5))) {
            for (const s of scored) {
                const key = `${s.product.category}|${s.product.subCategory}`;
                if (key === dominantFamily) s.similarity *= 1.12;
                else if (key.split('|')[0] === dominantFamily.split('|')[0]) s.similarity *= 1.04;
            }
        }

        // Apply a mild popularity tiebreaker via bestseller flag
        for (const s of scored) {
            if (s.product.bestseller) s.similarity *= 1.02;
        }

        scored.sort((a, b) => b.similarity - a.similarity);

        // Squash raw cosine to a friendlier display scale
        const top = scored.slice(0, 12).map(r => ({
            ...r.product.toObject(),
            matchScore: Math.round(Math.min(99, Math.max(20, r.rawSim * 100))),
            bestImageUrl: r.bestImageUrl
        }));

        return res.status(200).json(top);
    } catch (error) {
        console.log("visualSearch error", error);
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
        }
        return res.status(500).json({ message: `visualSearch error ${error.message}` });
    }
};

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.userId;
        const [userOrders, allOrders, allProducts, user] = await Promise.all([
            Order.find({ userId }),
            Order.find({}),
            Product.find({}),
            User.findById(userId).select('wishlist')
        ]);

        // Global signals (shared across all users)
        const popularity = recommendationEngine.buildPopularity(allOrders);
        const coPurchase = recommendationEngine.buildCoPurchaseMatrix(allOrders);

        // Normalize popularity to [0, 1]
        const maxPop = Math.max(1, ...popularity.values());

        const wishlistIds = new Set((user?.wishlist || []).map(String));

        // Cold-start: no purchase history → blend popularity + latest + wishlist-neighbors
        if (userOrders.length === 0) {
            const scored = [];
            for (const p of allProducts) {
                const pid = p._id.toString();
                if (wishlistIds.has(pid)) continue; // don't recommend what they already saved
                const popScore = (popularity.get(pid) || 0) / maxPop;
                const recency = 1 - Math.min(1, (Date.now() - p.date) / (90 * 24 * 60 * 60 * 1000));
                const bestseller = p.bestseller ? 0.15 : 0;
                scored.push({
                    product: p,
                    score: 0.55 * popScore + 0.35 * recency + bestseller,
                    matchScore: Math.round(40 + 50 * (0.55 * popScore + 0.35 * recency + bestseller))
                });
            }
            const top = scored
                .sort((a, b) => b.score - a.score)
                .slice(0, 10)
                .map(r => ({
                    ...r.product.toObject(),
                    matchScore: Math.min(95, Math.max(45, r.matchScore)),
                    isHighlyRecommended: false
                }));
            return res.status(200).json(top);
        }

        // Build weighted behavior signals from orders + reviews + wishlist
        const boughtProductIds = new Set();
        const behaviorItems = [];

        // Index user's reviews for sentiment weighting
        const userReviews = new Map();
        for (const p of allProducts) {
            const r = (p.reviews || []).find(rv => rv.userId.toString() === userId.toString());
            if (r) userReviews.set(p._id.toString(), r.rating);
        }

        const now = Date.now();
        const sixtyDays = 60 * 24 * 60 * 60 * 1000;

        // Purchases — strongest signal, time-decayed + sentiment-weighted
        for (const order of userOrders) {
            const age = now - order.date;
            const timeWeight = Math.max(0.5, 1.0 - (age / sixtyDays));
            for (const item of (order.items || [])) {
                const pid = (item._id || item.productId)?.toString();
                if (!pid) continue;
                boughtProductIds.add(pid);

                let sentiment = 1.0;
                const rating = userReviews.get(pid);
                if (rating) {
                    if (rating >= 4) sentiment = 2.0;
                    else if (rating === 3) sentiment = 1.0;
                    else sentiment = -1.0;
                }
                behaviorItems.push({ item, weight: timeWeight * sentiment * 1.0 });
            }
        }

        // Wishlist — weaker positive signal (intent, not commitment)
        for (const wid of wishlistIds) {
            if (boughtProductIds.has(wid)) continue;
            const p = allProducts.find(x => x._id.toString() === wid);
            if (p) behaviorItems.push({ item: p, weight: 0.4 });
        }

        if (behaviorItems.length === 0) {
            const top = allProducts.sort((a,b) => b.date - a.date).slice(0, 10);
            return res.status(200).json(top);
        }

        // Build the user's interest profile vector via weighted average of item embeddings
        const profileParts = await Promise.all(
            behaviorItems.map(async (bi) => ({
                emb: await recommendationEngine.getProductTextVec(bi.item),
                weight: bi.weight
            }))
        );

        const dim = profileParts[0].emb.length;
        const profileVec = new Array(dim).fill(0);
        let totalWeight = 0;
        for (const part of profileParts) {
            totalWeight += Math.abs(part.weight);
            for (let i = 0; i < dim; i++) {
                profileVec[i] += part.emb[i] * part.weight;
            }
        }
        if (totalWeight > 0) {
            for (let i = 0; i < dim; i++) profileVec[i] /= totalWeight;
        }

        // Build co-purchase boost map: products frequently bought alongside ours
        const coBoost = new Map();
        for (const pid of boughtProductIds) {
            const row = coPurchase.get(pid);
            if (!row) continue;
            for (const [neighbor, count] of row) {
                if (boughtProductIds.has(neighbor)) continue;
                coBoost.set(neighbor, (coBoost.get(neighbor) || 0) + count);
            }
        }
        const maxCoBoost = Math.max(1, ...coBoost.values());

        // Score candidates with multi-signal fusion
        const profileItems = behaviorItems.map(bi => bi.item);
        const candidates = [];

        for (const product of allProducts) {
            const pid = product._id.toString();
            if (boughtProductIds.has(pid)) continue;

            const vec = await recommendationEngine.getProductTextVec(product);
            const baseSim = recommendationEngine.cosine(profileVec, vec); // [-1, 1]

            // Normalize to [0, 1]
            let score = (baseSim + 1) / 2;

            // Complementary boost (e.g., TopWear bought → BottomWear up-weighted)
            score *= recommendationEngine.complementaryBoost(profileItems, product);

            // Collaborative filter: products frequently co-bought
            const co = (coBoost.get(pid) || 0) / maxCoBoost;
            score *= (1 + 0.25 * co);

            // Popularity prior (prevents dead-stock niche items dominating)
            const pop = (popularity.get(pid) || 0) / maxPop;
            score *= (1 + 0.10 * pop);

            // Freshness prior
            const ageDays = (now - product.date) / (24 * 60 * 60 * 1000);
            if (ageDays < 14) score *= 1.05;

            // Soft penalty on wishlisted items (they already know about these)
            if (wishlistIds.has(pid)) score *= 0.85;

            candidates.push({ product, vec, score });
        }

        // Sort by relevance, take top pool, then diversify with MMR
        candidates.sort((a, b) => b.score - a.score);
        const pool = candidates.slice(0, 40);
        const diversified = recommendationEngine.mmrDiversify(pool, 10, 0.72);

        // Scale scores for display
        const maxScore = Math.max(...diversified.map(d => d.score), 0.001);
        const top = diversified.map(r => {
            const displayScore = Math.round(50 + 49 * (r.score / maxScore));
            return {
                ...r.product.toObject(),
                matchScore: Math.max(50, Math.min(99, displayScore)),
                isHighlyRecommended: displayScore > 85
            };
        });

        return res.status(200).json(top);

    } catch (error) {
        console.error("GetRecommendations error", error);
        return res.status(500).json({ message: `GetRecommendations error ${error.message}` });
    }
};
