import uploadOnCloudinary from "../config/cloudinary.js"
import Product from "../model/productModel.js"
import User from "../model/userModel.js"


export const addProduct = async (req,res) => {
    try {
        let {name,description,price,category,subCategory,sizes,bestseller} = req.body

        let image1 = await uploadOnCloudinary(req.files.image1[0].path)
        let image2 = await uploadOnCloudinary(req.files.image2[0].path)
        let image3 = await uploadOnCloudinary(req.files.image3[0].path)
        let image4 = await uploadOnCloudinary(req.files.image4[0].path)
        
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
          console.log("AddProduct error")
    return res.status(500).json({message:`AddProduct error ${error}`})
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
