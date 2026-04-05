import express from 'express';
import { chat, resetSession } from '../controller/stylistController.js';

const stylistRoutes = express.Router();

stylistRoutes.post('/chat', chat);
stylistRoutes.post('/reset', resetSession);

export default stylistRoutes;
