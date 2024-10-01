import { create } from "zustand";
import axios from "axios";
import { Expense } from "@/types";

interface Totals {
  totalAmount: number;
  totalAmountInDollars: number;
  totalExpenses: number;
}

interface ExpensesState {
  expenses: Expense[];
  totals: Totals;
  isLoading: boolean;
  error: string | null;
  setExpenses: (expenses: Expense[]) => void;
  calculateTotals: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchExpenses: (userID: string) => Promise<void>;
  updateExpense: (id: string, newData: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  totals: {
    totalAmount: 0,
    totalAmountInDollars: 0,
    totalExpenses: 0,
  },
  isLoading: false,
  error: null,

  // Establecer los gastos
  setExpenses: (expenses) => set({ expenses }),

  // Calcular totales
  calculateTotals: () => {
    const { expenses } = get();
    console.log("Calculating totals for expenses:", expenses); // Verificar los datos antes de calcular

    if (expenses.length === 0) {
      set({
        totals: {
          totalAmount: 0,
          totalAmountInDollars: 0,
          totalExpenses: 0,
        },
      });
      return;
    }

    const totalAmount = expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );
    const totalAmountInDollars = expenses.reduce(
      (acc, expense) => acc + expense.amountInDollars,
      0
    );
    const totalExpenses = expenses.length;

    console.log("Total Amount in Dollars:", totalAmountInDollars); // Verificar el resultado del cálculo

    set({
      totals: {
        totalAmount,
        totalAmountInDollars,
        totalExpenses,
      },
    });
  },

  // Controlar el estado de carga
  setIsLoading: (isLoading) => set({ isLoading }),

  // Controlar el error
  setError: (error) => set({ error }),

  // Fetch expenses from the server
  fetchExpenses: async (userID: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/expenses/user/${userID}`);
      const fetchedExpenses = response.data;
      console.log("Fetched Expenses:", fetchedExpenses); // Verificar los datos recibidos
      set({ expenses: fetchedExpenses });
      get().calculateTotals();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Actualizar un gasto
  updateExpense: (id: string, newData: Partial<Expense>) => {
    const { expenses } = get();
    const updatedExpenses = expenses.map((expense) =>
      expense.id === id ? { ...expense, ...newData } : expense
    );
    set({ expenses: updatedExpenses });
  },

  // Eliminar un gasto
  deleteExpense: (id: string) => {
    const { expenses } = get();
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    set({ expenses: updatedExpenses });
    get().calculateTotals();
  },
}));
