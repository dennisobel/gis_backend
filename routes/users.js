import { Router } from "express";
const router = Router();

/** import all controllers */
import {
  getBusinessesByPaymentStatus
} from "../controllers/auth.js";
import Auth from "../middleware/auth.js";
import { sendMail } from "../controllers/mailer.js";

/** POST Methods */
router.get("/payment-summary", Auth, getBusinessesByPaymentStatus);
router.post('/send-mail', sendMail)

export default router;
