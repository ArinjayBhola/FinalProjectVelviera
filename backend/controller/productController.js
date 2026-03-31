import uploadOnCloudinary from "../config/cloudinary.js"
import Product from "../model/productModel.js"
import User from "../model/userModel.js"
import Order from "../model/orderModel.js"
import recommendationEngine from "../utils/recommendationEngine.js"


export const addProduct = async (req,res) => {
    try {
        let {name,description,price,category,subCategory,sizes,bestseller} = req.body

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
            image4
            
        }

        const product = await Product.create(productData)

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
        const product = await Product.findByIdAndDelete(id)
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

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({ userId });
        const allProducts = await Product.find({});

        if (orders.length === 0) {
            // Fallback to latest products if no orders
            const fallback = allProducts.sort((a, b) => b.date - a.date).slice(0, 8);
            return res.status(200).json(fallback);
        }

        const boughtProductIds = new Set();
        const weightedProducts = [];

        // Fetch user reviews to use as sentiment signal
        const userReviews = new Map(); // productId -> rating
        allProducts.forEach(p => {
            const review = p.reviews.find(r => r.userId.toString() === userId.toString());
            if (review) userReviews.set(p._id.toString(), review.rating);
        });

        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        orders.forEach(order => {
            // Time decay factor: newer orders have higher weight
            const age = now - order.date;
            const timeWeight = Math.max(0.5, 1.0 - (age / (thirtyDays * 2))); 

            order.items.forEach(item => {
                const pid = (item._id || item.productId)?.toString();
                if (pid) {
                    boughtProductIds.add(pid);
                    
                    // Sentiment weight: 1-5 stars mapped to -1.0 to 2.0
                    let sentimentWeight = 1.0;
                    const rating = userReviews.get(pid);
                    if (rating) {
                        if (rating >= 4) sentimentWeight = 2.0;
                        else if (rating === 3) sentimentWeight = 1.0;
                        else sentimentWeight = -1.0; 
                    }

                    weightedProducts.push({
                        item,
                        weight: timeWeight * sentimentWeight,
                        category: item.category,
                        subCategory: item.subCategory
                    });
                }
            });
        });

        if (weightedProducts.length === 0) {
            return res.status(200).json(allProducts.slice(0, 8));
        }

        // Generate Weighted Interest Profile
        const profileParts = await Promise.all(
            weightedProducts.map(async (wp) => {
                const emb = await recommendationEngine.getEmbedding(recommendationEngine.prepareProductText(wp.item));
                return { emb, weight: wp.weight };
            })
        );

        const vectorDim = profileParts[0].emb.length;
        const profileVector = new Array(vectorDim).fill(0);
        let totalWeight = 0;

        profileParts.forEach(part => {
            const w = part.weight;
            totalWeight += Math.abs(w);
            for (let i = 0; i < vectorDim; i++) {
                profileVector[i] += part.emb[i] * w;
            }
        });

        if (totalWeight > 0) {
            for (let i = 0; i < vectorDim; i++) {
                profileVector[i] /= totalWeight;
            }
        }

        // Calculate recommendations with Complementary Boosting
        const recommendations = [];
        const profilesForBoosting = weightedProducts.map(wp => wp.item);

        for (let product of allProducts) {
            if (boughtProductIds.has(product._id.toString())) continue;

            const productText = recommendationEngine.prepareProductText(product);
            const productEmbedding = await recommendationEngine.getEmbedding(productText);
            
            // Base similarity
            let score = recommendationEngine.calculateSimilarity(profileVector, productEmbedding);
            
            // Complementary boost
            const categoryBoost = recommendationEngine.calculateComplementaryScore(profilesForBoosting, product);
            score *= categoryBoost;

            recommendations.push({ 
                product, 
                score,
                matchScore: Math.round(Math.min(99, Math.max(40, score * 100)))
            });
        }

        const topRecommendations = recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 8)
            .map(r => ({
                ...r.product.toObject(),
                matchScore: r.matchScore,
                isHighlyRecommended: r.matchScore > 85
            }));

        return res.status(200).json(topRecommendations);

    } catch (error) {
        console.error("GetRecommendations error", error);
        return res.status(500).json({ message: `GetRecommendations error ${error.message}` });
    }
};
