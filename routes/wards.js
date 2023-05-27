import express from 'express';
import {
  getTransactionSummaryByWard,
  getTransactionSummaryForWards
} from '../controllers/ward.js';

const router = express.Router();

router.get('/summary', getTransactionSummaryForWards);
router.get('/:id/summary', getTransactionSummaryByWard);
// router.get('/', getTransactions);
// router.get('/:id', getTransactionById);
// router.post('/', createTransaction);
// router.put('/:id', updateTransaction);
// router.delete('/:id', deleteTransaction);

export default router;
