import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import Product from "./model/productModel.js";
import Category from "./model/categoryModel.js";

dotenv.config();

const categoriesData = [
    { name: "Men" },
    { name: "Women" },
    { name: "Kids" },
    { name: "Electronics" },
    { name: "Home & Kitchen" }
];

const productsData = [
    {
        name: "Premium Cotton T-Shirt",
        description: "A high-quality cotton t-shirt for daily wear.",
        price: 25,
        category: "Men",
        subCategory: "Topwear",
        sizes: ["S", "M", "L", "XL"],
        bestseller: true,
        image1: "https://pagedone.io/asset/uploads/1700730453.png",
        image2: "https://pagedone.io/asset/uploads/1700730453.png",
        image3: "https://pagedone.io/asset/uploads/1700730453.png",
        image4: "https://pagedone.io/asset/uploads/1700730453.png",
        date: Date.now()
    },
    {
        name: "Floral Summer Dress",
        description: "Light and airy floral dress perfect for summer.",
        price: 45,
        category: "Women",
        subCategory: "Bottomwear",
        sizes: ["S", "M", "L"],
        bestseller: false,
        image1: "https://pagedone.io/asset/uploads/1700730514.png",
        image2: "https://pagedone.io/asset/uploads/1700730514.png",
        image3: "https://pagedone.io/asset/uploads/1700730514.png",
        image4: "https://pagedone.io/asset/uploads/1700730514.png",
        date: Date.now()
    },
    {
        name: "Wireless Noise Cancelling Headphones",
        description: "Experience pure sound with our latest noise cancelling technology.",
        price: 199,
        category: "Electronics",
        subCategory: "Accessories",
        sizes: ["One Size"],
        bestseller: true,
        image1: "https://pagedone.io/asset/uploads/1711516040.png",
        image2: "https://pagedone.io/asset/uploads/1711516040.png",
        image3: "https://pagedone.io/asset/uploads/1711516040.png",
        image4: "https://pagedone.io/asset/uploads/1711516040.png",
        date: Date.now()
    }
];

const seedDatabase = async () => {
    try {
        await connectDb();

        // Delete existing data
        await Product.deleteMany({});
        await Category.deleteMany({});

        console.log("Deleted all products and categories.");

        // Insert categories
        const createdCategories = await Category.insertMany(categoriesData);
        console.log("Inserted categories.");

        // Insert products
        await Product.insertMany(productsData);
        console.log("Inserted products.");

        console.log("Database seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
