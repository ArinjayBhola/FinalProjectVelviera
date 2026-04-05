import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    label: { type: String, default: "Home" },
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    email: { type: String, default: "" },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true })

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String
    },
    cartData:{
        type:Object,
        default:{}
    },
    wishlist:{
        type:Array,
        default:[]
    },
    addresses:{
        type: [addressSchema],
        default: []
    }
},{timestamps:true , minimize:false})

const User = mongoose.model("User",userSchema)

export default User