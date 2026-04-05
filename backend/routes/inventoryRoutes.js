import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { getLowStockProducts, updateStock } from "../controller/inventoryController.js";

const inventoryRoutes = express.Router();

inventoryRoutes.get("/low-stock", adminAuth, getLowStockProducts);
inventoryRoutes.put("/stock/:productId", adminAuth, updateStock);

export default inventoryRoutes;
