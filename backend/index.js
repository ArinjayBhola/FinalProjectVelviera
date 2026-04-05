import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'
dotenv.config()
import cors from "cors"
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import categoryRouter from './routes/categoryRoute.js'
import addressRoutes from './routes/addressRoutes.js'
import socialProofRoutes from './routes/socialProofRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'
import stylistRoutes from './routes/stylistRoutes.js'
import embeddingStore from './utils/embeddingStore.js'
import recommendationEngine from './utils/recommendationEngine.js'
import visualSearchEngine from './utils/visualSearchEngine.js'
import Product from './model/productModel.js'

let port = process.env.PORT || 6000

let app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
 origin:["http://localhost:5173", "http://localhost:5174"],
 credentials:true
}))

app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
app.use("/api/product",productRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/order",orderRoutes)
app.use("/api/admin",adminRouter)
app.use("/api/category",categoryRouter)
app.use("/api/address",addressRoutes)
app.use("/api/social",socialProofRoutes)
app.use("/api/inventory",inventoryRoutes)
app.use("/api/stylist",stylistRoutes)




// Warmup ML models + embedding cache in the background after DB connects.
// Runs once on startup, reuses disk cache, and doesn't block the server.
async function warmupEngines() {
    try {
        embeddingStore.load();
        const products = await Product.find({}).lean();
        embeddingStore.pruneMissing(products.map(p => p._id));
        console.log(`[Warmup] ${products.length} products in DB. Cache:`, embeddingStore.stats());

        // Text embeddings first (fast) — powers recommendations
        await recommendationEngine.warmupProducts(products);

        // Image embeddings second (slow) — powers visual search
        await visualSearchEngine.warmupProducts(products);

        console.log('[Warmup] Engines ready. Final cache:', embeddingStore.stats());
    } catch (e) {
        console.log('[Warmup] Error during warmup:', e.message);
    }
}

app.listen(port, () => {
    console.log("Hello From Server")
    connectDb().then(() => {
        setTimeout(warmupEngines, 1500);
    });
})

// Flush cache on shutdown so embeddings survive restarts
process.on('SIGINT', () => { embeddingStore.flushSync(); process.exit(0); });
process.on('SIGTERM', () => { embeddingStore.flushSync(); process.exit(0); });


