import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";

export const getDashboardStats = async (req, res) => {
    try {
        const orders = await Order.find({});
        const products = await Product.find({});

        // 1. Basic Stats
        const totalRevenue = orders
            .filter(order => order.payment)
            .reduce((sum, order) => sum + order.amount, 0);
        
        const totalOrders = orders.length;
        const totalProducts = products.length;

        // 2. Daily Sales (Last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            
            const daySales = orders
                .filter(order => {
                    const orderDate = new Date(order.date);
                    return orderDate.toDateString() === date.toDateString() && order.payment;
                })
                .reduce((sum, order) => sum + order.amount, 0);

            last7Days.push({ date: dateStr, sales: daySales });
        }

        // 3. Category Distribution
        const categoryData = {};
        orders.forEach(order => {
            if (order.payment) {
                order.items.forEach(item => {
                    const category = item.category || 'Uncategorized';
                    categoryData[category] = (categoryData[category] || 0) + (item.price * item.quantity);
                });
            }
        });

        const categoryStats = Object.keys(categoryData).map(key => ({
            name: key,
            value: categoryData[key]
        }));

        res.status(200).json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                totalProducts,
                recentSales: last7Days,
                categoryStats
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
