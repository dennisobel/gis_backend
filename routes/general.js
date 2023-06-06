import express from "express";
import { getUser, getDashboardStats, getSummaries, sendStkPush, handleStkPushCallback } from "../controllers/general.js";

const router = express.Router();

router.get("/user/:id", getUser);
router.get("/dashboard", getDashboardStats);
router.get("/summaries", getSummaries);
router.post("/stk", sendStkPush);
router.post("/stkCallback", handleStkPushCallback);

export default router;