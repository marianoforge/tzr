import axios from 'axios';

import { Expense } from '@/common/types/';
import { useAuthStore } from '@/stores/authStore';

export const createExpense = async (expenseData: Expense) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.post('/api/expenses', expenseData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createExpenseAgents = async (expenseData: Expense) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.post('/api/expensesAgents', expenseData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchUserExpenses = async (userUID: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.get(`/api/expenses?user_uid=${userUID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteExpense = async (id: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.delete(`/api/expenses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateExpense = async (expense: Expense) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.put(`/api/expenses/${expense.id}`, expense, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
