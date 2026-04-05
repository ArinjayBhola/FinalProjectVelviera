import express from "express";
import { heartbeatViewer, getSocialProof } from "../controller/socialProofController.js";

const socialProofRoutes = express.Router();

socialProofRoutes.post("/viewers/heartbeat", heartbeatViewer);
socialProofRoutes.get("/product/:productId", getSocialProof);

export default socialProofRoutes;
