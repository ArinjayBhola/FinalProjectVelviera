import express from "express"
import isAuth from "../middleware/isAuth.js"
import { getAdmin, getCurrentUser, toggleWishlist } from "../controller/userController.js"
import adminAuth from "../middleware/adminAuth.js"

let userRoutes = express.Router()

userRoutes.get("/getcurrentuser",isAuth,getCurrentUser)
userRoutes.get("/getadmin",adminAuth,getAdmin)
userRoutes.post("/wishlist/toggle", isAuth, toggleWishlist)



export default userRoutes