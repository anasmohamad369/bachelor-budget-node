import { Request, Response } from 'express';
import ExpenseModel from '../model/Expense';
import { Expense } from '../type';

// Get all expenses with optional filtering and sorting
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { filter, sortKey = 'date', sortDirection = 'descending' } = req.query;

    // Build query
    const query: any = {};
    if (filter && filter !== 'all') {
      query.username = filter;
    }

    // Build sort options
    const sort: any = {};
    if (sortKey) {
      sort[sortKey as string] = sortDirection === 'ascending' ? 1 : -1;
    }

    const expenses = await ExpenseModel.find(query).sort(sort);
    res.status(200).json({
      success: true,
      data: expenses.map(exp => ({ ...exp.toJSON(), id: exp._id.toString() })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching expenses', error });
  }
};

// Add a new expense
export const addExpense = async (req: Request, res: Response) => {
  try {
    const { username, description, amount, date } = req.body;

    if (!username || !description || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    const expense = new ExpenseModel({
      username,
      description,
      amount,
      date: date || new Date().toISOString().split('T')[0],
    });

    await expense.save();
    res.status(201).json({
      success: true,
      data: { ...expense.toJSON(), id: expense._id.toString() },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding expense', error });
  }
};

// Delete an expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expense = await ExpenseModel.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting expense', error });
  }
};

// Get user totals
export const getUserTotals = async (req: Request, res: Response) => {
  try {
    const totals = await ExpenseModel.aggregate([
      {
        $group: {
          _id: '$username',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          username: '$_id',
          total: 1,
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    const totalExpenses = totals.reduce((sum, user) => sum + user.total, 0);

    res.status(200).json({
      success: true,
      data: {
        userTotals: totals,
        totalExpenses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user totals', error });
  }
};