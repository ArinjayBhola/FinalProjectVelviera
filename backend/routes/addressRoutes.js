import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
    getAddresses, addAddress, updateAddress,
    deleteAddress, setDefaultAddress
} from "../controller/addressController.js";

const addressRoutes = express.Router();

addressRoutes.get("/list", isAuth, getAddresses);
addressRoutes.post("/add", isAuth, addAddress);
addressRoutes.put("/update/:addressId", isAuth, updateAddress);
addressRoutes.delete("/delete/:addressId", isAuth, deleteAddress);
addressRoutes.put("/default/:addressId", isAuth, setDefaultAddress);

export default addressRoutes;
