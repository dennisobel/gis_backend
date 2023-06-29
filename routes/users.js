import { Router } from "express";
const router = Router();

/** import all controllers */
import {
  activity_log,
  getBusinessesByPaymentStatus, getUserSummary
} from "../controllers/auth.js";
import Auth from "../middleware/auth.js";
import { sendMail } from "../controllers/mailer.js";

/** POST Methods */
router.get("/payment-summary", Auth, getBusinessesByPaymentStatus);
router.post('/send-mail', sendMail)
router.get('/summary', Auth, getUserSummary)
router.get('/activity', Auth, activity_log)

export default router;
