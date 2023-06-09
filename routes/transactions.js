import express from "express";
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsSummary,
  getDailyTransactions,
  getMonthlyTransactions,
  verifyTransaction,
} from "../controllers/transactions.js";
import Auth from "../middleware/auth.js";

const router = express.Router();

router.get("/summary", Auth, getTransactionsSummary);
router.get("/daily", Auth, getDailyTransactions);
router.get("/monthly", Auth, getMonthlyTransactions);
router.get("/", Auth, getTransactions);
router.get("/:id", Auth, getTransactionById);
router.post("/", Auth, createTransaction);
router.put("/:id", Auth, updateTransaction);
router.delete("/:id", Auth, deleteTransaction);
router.post("/verify", Auth, verifyTransaction);

export default router;
