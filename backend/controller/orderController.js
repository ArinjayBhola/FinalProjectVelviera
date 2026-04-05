import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import razorpay from 'razorpay'
import dotenv from 'dotenv'
dotenv.config()
const currency = 'inr'
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// for User
export const placeOrder = async (req,res) => {

     try {
         const {items , amount , address} = req.body;
         const userId = req.userId;
         
         const user = await User.findById(userId);
         if (!user) {
             return res.status(404).json({ message: "User not found" });
         }
         const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod:'COD',
            payment:false,
            date: Date.now()
         }

         const newOrder = new Order(orderData)
         await newOrder.save()

         // Decrement stock for each item
         for (const item of items) {
            const pid = item._id || item.productId;
            if (!pid) continue;
            await Product.findByIdAndUpdate(pid, {
                $inc: { stock: -(Number(item.quantity) || 1) }
            });
         }

         await User.findByIdAndUpdate(userId,{cartData:{}})

         return res.status(201).json({message:'Order Place'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Order Place error'})
    }
    
}


export const placeOrderRazorpay = async (req,res) => {
    try {
        
         const {items , amount , address} = req.body;
         const userId = req.userId;
         
         const user = await User.findById(userId);
         if (!user) {
             return res.status(404).json({ message: "User not found" });
         }
         const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod:'Razorpay',
            payment:false,
            date: Date.now()
         }

         const newOrder = new Order(orderData)
         await newOrder.save()

         const options = {
            amount:amount * 100,
            currency: currency.toUpperCase(),
            receipt : newOrder._id.toString()
         }
         await razorpayInstance.orders.create(options, (error,order)=>{
            if(error) {
                console.log(error)
                return res.status(500).json(error)
            }
            res.status(200).json(order)
         })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message
            })
    }
}


export const verifyRazorpay = async (req,res) =>{
    try {
        const userId = req.userId
        const {razorpay_order_id} = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if(orderInfo.status === 'paid'){
            await Order.findByIdAndUpdate(orderInfo.receipt,{payment:true});
            await User.findByIdAndUpdate(userId , {cartData:{}})
            res.status(200).json({message:'Payment Successful'
            })
        }
        else{
            res.json({message:'Payment Failed'
            })
        }
    } catch (error) {
        console.log(error)
         res.status(500).json({message:error.message
            })
    }
}






export const userOrders = async (req,res) => {
      try {
        const userId = req.userId;
        const orders = await Order.find({userId})
        return res.status(200).json({ success: true, orders })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "userOrders error" })
    }
    
}

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.userId;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.userId !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Allow cancellation only if order is not yet shipped or delivered
        if (order.status !== 'Order Placed' && order.status !== 'Packing') {
            return res.status(400).json({ success: false, message: `Cannot cancel order in ${order.status} state` });
        }

        order.status = 'Cancelled';
        await order.save();

        // Restore stock for each cancelled item
        await restoreStockForOrder(order);

        res.status(200).json({ success: true, message: 'Order cancelled successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const returnOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.userId;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.userId !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (order.status !== 'Delivered') {
            return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
        }

        // Check if within 7 days of delivery (using updatedAt as approximation for delivery time)
        const deliveryDate = new Date(order.updatedAt);
        const currentDate = new Date();
        const diffInDays = Math.ceil((currentDate - deliveryDate) / (1000 * 60 * 60 * 24));

        if (diffInDays > 7) {
            return res.status(400).json({ success: false, message: 'Return window (7 days) has expired' });
        }

        order.status = 'Return Requested';
        await order.save();

        res.status(200).json({ success: true, message: 'Return request submitted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}




//for Admin



    
export const allOrders = async (req,res) => {
    try {
        const orders = await Order.find({})
        res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"adminAllOrders error"})
        
    }
    
}
    
export const updateStatus = async (req,res) => {
try {
    const {orderId , status} = req.body

    const order = await Order.findById(orderId)
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' })
    }

    const stockReturningStatuses = ['Cancelled', 'Returned']
    const wasRestorable = stockReturningStatuses.includes(order.status)
    const becomesRestorable = stockReturningStatuses.includes(status)

    order.status = status
    await order.save()

    // Restore stock only once, when transitioning INTO a restocking state
    if (!wasRestorable && becomesRestorable) {
        await restoreStockForOrder(order)
    }

    return res.status(200).json({ success: true, message: 'Status Updated' })
} catch (error) {
     return res.status(500).json({ success: false, message: error.message })
}
}

// Helper: increment stock back for every item in an order
async function restoreStockForOrder(order) {
    try {
        for (const item of (order.items || [])) {
            const pid = item._id || item.productId
            if (!pid) continue
            await Product.findByIdAndUpdate(pid, {
                $inc: { stock: Number(item.quantity) || 1 }
            })
        }
    } catch (e) {
        console.log('restoreStockForOrder error', e.message)
    }
}