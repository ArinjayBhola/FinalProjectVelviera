import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import Product from "./model/productModel.js";
import Category from "./model/categoryModel.js";

dotenv.config();

const categoriesData = [
    { name: "Men" },
    { name: "Women" },
    { name: "Kids" }
];

const productsData = [
    // Men - TopWear
    {
        name: "Classic White Oxford Shirt",
        description: "A timeless white oxford shirt made from premium cotton. Perfect for formal and semi-formal occasions.",
        price: 45,
        category: "Men",
        subCategory: "TopWear",
        sizes: ["S", "M", "L", "XL", "XXL"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1598033129183-c4f50c717658?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1598033129183-c4f50c717658?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1598033129183-c4f50c717658?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1598033129183-c4f50c717658?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Navy Blue Crewneck T-Shirt",
        description: "Soft and breathable navy blue t-shirt for daily essentials.",
        price: 22,
        category: "Men",
        subCategory: "TopWear",
        sizes: ["M", "L", "XL"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    // Men - BottomWear
    {
        name: "Slim Fit Black Chinos",
        description: "Versatile black chinos with a slim fit. Ideal for office or casual wear.",
        price: 55,
        category: "Men",
        subCategory: "BottomWear",
        sizes: ["30", "32", "34", "36"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Light Wash Denim Jeans",
        description: "Classic denim jeans in a light blue wash for a relaxed look.",
        price: 60,
        category: "Men",
        subCategory: "BottomWear",
        sizes: ["30", "32", "34"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    // Men - WinterWear
    {
        name: "Quilted Bomber Jacket",
        description: "Stay warm and stylish with this navy quilted bomber jacket.",
        price: 85,
        category: "Men",
        subCategory: "WinterWear",
        sizes: ["L", "XL", "XXL"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Grey Woolen Sweater",
        description: "A cozy grey woolen sweater for the colder months.",
        price: 40,
        category: "Men",
        subCategory: "WinterWear",
        sizes: ["M", "L", "XL"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },

    // Women - TopWear
    {
        name: "Silk Polka Dot Blouse",
        description: "Elegant silk blouse with a classic polka dot print.",
        price: 50,
        category: "Women",
        subCategory: "TopWear",
        sizes: ["XS", "S", "M", "L"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Basic White Crop Top",
        description: "A staple white crop top for layering or wearing on its own.",
        price: 18,
        category: "Women",
        subCategory: "TopWear",
        sizes: ["S", "M"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    // Women - BottomWear
    {
        name: "High Waisted Pleated Skirt",
        description: "Chic high-waisted pleated skirt in a soft beige color.",
        price: 35,
        category: "Women",
        subCategory: "BottomWear",
        sizes: ["S", "M", "L"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Floral Summer Palazzo",
        description: "Flowy and comfortable floral palazzo pants for summer days.",
        price: 30,
        category: "Women",
        subCategory: "BottomWear",
        sizes: ["M", "L", "XL"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    // Women - WinterWear
    {
        name: "Beige Trench Coat",
        description: "A sophisticated beige trench coat, a must-have for every wardrobe.",
        price: 120,
        category: "Women",
        subCategory: "WinterWear",
        sizes: ["S", "M", "L", "XL"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Faux Fur Overcoat",
        description: "Luxurious faux fur overcoat for ultimate warmth and style.",
        price: 150,
        category: "Women",
        subCategory: "WinterWear",
        sizes: ["M", "L"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },

    // Kids - TopWear
    {
        name: "Cartoon Print T-Shirt",
        description: "Fun and colorful t-shirt with a favorite cartoon print for kids.",
        price: 15,
        category: "Kids",
        subCategory: "TopWear",
        sizes: ["2T", "4T", "6T"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1519235106638-30cc51ec143b?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1519235106638-30cc51ec143b?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1519235106638-30cc51ec143b?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1519235106638-30cc51ec143b?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Striped Cotton Polo",
        description: "Smart striped cotton polo shirt for young boys.",
        price: 20,
        category: "Kids",
        subCategory: "TopWear",
        sizes: ["6T", "8", "10"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1519457431-75514b731b73?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1519457431-75514b731b73?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1519457431-75514b731b73?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1519457431-75514b731b73?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    // Kids - BottomWear
    {
        name: "Drawstring Jogger Pants",
        description: "Comfortable drawstring joggers for active kids.",
        price: 25,
        category: "Kids",
        subCategory: "BottomWear",
        sizes: ["4T", "6T", "8"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1519457431-75514b731b73?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1519457431-75514b731b73?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1519457431-75514b731b73?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1519457431-75514b731b73?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Kids Denim Overalls",
        description: "Classic denim overalls for a cool and casual kid's look.",
        price: 35,
        category: "Kids",
        subCategory: "BottomWear",
        sizes: ["2T", "4T", "6T"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1519278454561-7897af559fc7?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1519278454561-7897af559fc7?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1519278454561-7897af559fc7?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1519278454561-7897af559fc7?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    // Kids - WinterWear
    {
        name: "Bright Yellow Puffer Jacket",
        description: "Keep them warm and visible with this bright yellow puffer jacket.",
        price: 55,
        category: "Kids",
        subCategory: "WinterWear",
        sizes: ["4T", "6T", "8"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Knit Hat and Glove Set",
        description: "A cute knit hat and glove set for the winter season.",
        price: 15,
        category: "Kids",
        subCategory: "WinterWear",
        sizes: ["One Size"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },

    // Extra products to reach 24 and test pagination (12/page)
    {
        name: "Premium Leather Belt",
        description: "Handcrafted premium leather belt in dark brown.",
        price: 45,
        category: "Men",
        subCategory: "TopWear",
        sizes: ["S", "M", "L"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Designer Sunglasses",
        description: "Stylish designer sunglasses with UV protection.",
        price: 130,
        category: "Women",
        subCategory: "TopWear",
        sizes: ["One Size"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1511499767350-a1590fdb2e47?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1511499767350-a1590fdb2e47?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1511499767350-a1590fdb2e47?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1511499767350-a1590fdb2e47?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Silver Pendant Necklace",
        description: "Delicate silver pendant necklace for everyday elegance.",
        price: 75,
        category: "Women",
        subCategory: "BottomWear", // Just for testing combination
        sizes: ["One Size"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Canvas Backpack",
        description: "Durable canvas backpack for school or weekend trips.",
        price: 40,
        category: "Kids",
        subCategory: "TopWear",
        sizes: ["Medium"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Cotton Ankle Socks (Pack of 3)",
        description: "Soft cotton ankle socks, comfortable and durable.",
        price: 12,
        category: "Men",
        subCategory: "BottomWear",
        sizes: ["9-11"],
        bestseller: false,
        image1: "https://images.unsplash.com/photo-1582966298431-997a7e1ad065?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1582966298431-997a7e1ad065?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1582966298431-997a7e1ad065?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1582966298431-997a7e1ad065?auto=format&fit=crop&q=80&w=800",
        date: Date.now()
    },
    {
        name: "Lace-Up Sneakers",
        description: "Retro-style lace-up sneakers for casual outings.",
        price: 65,
        category: "Women",
        subCategory: "WinterWear",
        sizes: ["6", "7", "8"],
        bestseller: true,
        image1: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
        image2: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
        image3: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
        image4: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
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
        await Category.insertMany(categoriesData);
        console.log("Inserted categories.");

        // Generate more product data
        const moreProducts = productsData.map(p => ({
            ...p,
            name: "Signature " + p.name,
            price: p.price + 15,
            date: Date.now() + 1000
        }));
        const ultraProducts = productsData.map(p => ({
            ...p,
            name: "Ultra " + p.name,
            price: p.price + 25,
            date: Date.now() + 2000
        }));
        const classicProducts = productsData.map(p => ({
            ...p,
            name: "Classic " + p.name,
            price: p.price - 5,
            date: Date.now() - 1000
        }));
        const allProducts = [...productsData, ...moreProducts, ...ultraProducts, ...classicProducts];

        // Insert products
        await Product.insertMany(allProducts);
        console.log("Inserted products.");

        console.log(`Database seeded successfully with ${allProducts.length} products!`);
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();

