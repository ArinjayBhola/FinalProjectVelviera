import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image1:{
        type:String,
        default:""
    },
    image2:{
        type:String,
        default:""
    },
    image3:{
        type:String,
        default:""
    },
    image4:{
        type:String,
        default:""
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    subCategory:{
        type:String,
        required:true
    },
    sizes:{
        type:Array,
        required:true
    },
    date:{
        type:Number,
        required:true
    },
    bestseller:{
        type:Boolean
    },
    reviews: {
        type: [
            {
                userId: { type: String, required: true },
                name: { type: String, required: true },
                rating: { type: Number, required: true, min: 1, max: 5 },
                comment: { type: String, required: true },
                date: { type: Number, required: true }
            }
        ],
        default: []
    }

},{timestamps:true})

const Product = mongoose.model("Product" , productSchema)

export default Product