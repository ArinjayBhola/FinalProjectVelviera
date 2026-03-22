import categoryModel from "../model/categoryModel.js";

// Add Category
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.json({ success: false, message: "Name is required" });
        }
        const category = await categoryModel.create({ name });
        res.json({ success: true, message: "Category added successfully", category });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// List Categories
const listCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({});
        res.json({ success: true, categories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Remove Category
const removeCategory = async (req, res) => {
    try {
        await categoryModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Category removed successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addCategory, listCategories, removeCategory };
