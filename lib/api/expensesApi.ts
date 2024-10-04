import axios from "axios";
import { Expense } from "@/types";

// Crear un nuevo gasto
export const createExpense = async (expenseData: Expense) => {
  const response = await axios.post("/api/expenses", expenseData);
  return response.data;
};

// Obtener gastos de un usuario
export const fetchUserExpenses = async (userUID: string) => {
  const response = await axios.get(`/api/expenses?user_uid=${userUID}`);
  return response.data;
};

// Eliminar un gasto por ID
export const deleteExpense = async (id: string) => {
  const response = await axios.delete(`/api/expenses/${id}`);
  return response.data;
};

// Actualizar un gasto
export const updateExpense = async (expense: Expense) => {
  const response = await axios.put(`/api/expenses/${expense.id}`, expense);
  return response.data;
};
