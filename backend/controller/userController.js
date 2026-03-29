import User from "../model/userModel.js"


export const getCurrentUser = async (req,res) => {
    try {
        let user = await User.findById(req.userId).select("-password")
        if(!user){
           return res.status(404).json({message:"user is not found"}) 
        }
        return res.status(200).json(user)
    } catch (error) {
         console.log(error)
    return res.status(500).json({message:`getCurrentUser error ${error}`})
    }
}

export const getAdmin = async (req,res) => {
    try {
        let adminEmail = req.adminEmail;
        if(!adminEmail){
            return res.status(404).json({message:"Admin is not found"}) 
        }
        return res.status(201).json({
            email:adminEmail,
            role:"admin"
        })
    } catch (error) {
        console.log(error)
    return res.status(500).json({message:`getAdmin error ${error}`})
    }
}

export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.wishlist.includes(productId)) {
            user.wishlist = user.wishlist.filter(id => id !== productId);
        } else {
            user.wishlist.push(productId);
        }

        await user.save();
        return res.status(200).json(user.wishlist);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `toggleWishlist error: ${error}` });
    }
};