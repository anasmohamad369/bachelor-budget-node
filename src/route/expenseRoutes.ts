import express from 'express';
import { getExpenses, addExpense, deleteExpense, getUserTotals } from '../controller/expenseController';

const router = express.Router();

router.get('/expenses', getExpenses);
router.post('/expenses', addExpense);
router.delete('/expenses/:id', deleteExpense);
router.get('/totals', getUserTotals);

export default router;