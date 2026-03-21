import express from 'express';
import { getDashboardStats } from '../controller/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const adminRouter = express.Router();

adminRouter.get('/stats', adminAuth, getDashboardStats);

export default adminRouter;
