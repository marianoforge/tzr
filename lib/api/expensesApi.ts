import axios from 'axios';

import { Expense } from '@/common/types/';

export const createExpense = async (expenseData: Expense) => {
  const response = await axios.post('/api/expenses', expenseData);
  return response.data;
};

export const createExpenseAgents = async (expenseData: Expense) => {
  const response = await axios.post('/api/expensesAgents', expenseData);
  return response.data;
};

export const fetchUserExpenses = async (userUID: string) => {
  const response = await axios.get(`/api/expenses?user_uid=${userUID}`);
  return response.data;
};

export const deleteExpense = async (id: string) => {
  const response = await axios.delete(`/api/expenses/${id}`);
  return response.data;
};

export const updateExpense = async (expense: Expense) => {
  const response = await axios.put(`/api/expenses/${expense.id}`, expense);
  return response.data;
};
