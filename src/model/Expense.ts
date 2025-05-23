import mongoose, { Schema } from 'mongoose';
import { Expense } from '../type';

const expenseSchema = new Schema<Expense>({
  username: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<Expense>('Expense', expenseSchema);