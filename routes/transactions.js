import express from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsSummary,
  getDailyTransactions,
  getMonthlyTransactions,
} from '../controllers/transactions.js';

const router = express.Router();

router.get('/summary', getTransactionsSummary);
router.get('/daily', getDailyTransactions)
router.get('/monthly', getMonthlyTransactions)
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
