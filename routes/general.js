import express from "express";
import { getUser, getDashboardStats, getSummaries } from "../controllers/general.js";

const router = express.Router();

router.get("/user/:id", getUser);
router.get("/dashboard", getDashboardStats);
router.get("/summaries", getSummaries);

export default router;