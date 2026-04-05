import Product from "../model/productModel.js";

/**
 * Returns low-stock + out-of-stock products.
 * A product is low-stock if stock > 0 AND stock <= lowStockThreshold.
 * A product is out-of-stock if stock === 0.
 */
export const getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({});

        const outOfStock = [];
        const lowStock = [];

        for (const p of products) {
            const stock = p.stock ?? 0;
            const threshold = p.lowStockThreshold ?? 5;
            if (stock === 0) {
                outOfStock.push(p);
            } else if (stock <= threshold) {
                lowStock.push(p);
            }
        }

        // Sort by stock ascending (most urgent first)
        lowStock.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

        return res.status(200).json({
            success: true,
            summary: {
                outOfStockCount: outOfStock.length,
                lowStockCount: lowStock.length,
                totalAlerts: outOfStock.length + lowStock.length
            },
            outOfStock,
            lowStock
        });
    } catch (error) {
        console.log("getLowStockProducts error", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update stock for a product. Admin can set absolute stock or delta.
 * Body: { stock?: number, delta?: number, lowStockThreshold?: number }
 */
export const updateStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock, delta, lowStockThreshold } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (typeof stock === 'number') {
            product.stock = Math.max(0, Math.floor(stock));
        } else if (typeof delta === 'number') {
            product.stock = Math.max(0, (product.stock ?? 0) + Math.floor(delta));
        }

        if (typeof lowStockThreshold === 'number') {
            product.lowStockThreshold = Math.max(0, Math.floor(lowStockThreshold));
        }

        await product.save();
        return res.status(200).json({ success: true, product });
    } catch (error) {
        console.log("updateStock error", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
