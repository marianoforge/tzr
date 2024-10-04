import { create } from "zustand";
import axios from "axios";
import { Expense, ExpensesState } from "@/types";

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  totals: {
    totalAmount: 0,
    totalAmountInDollars: 0,
    totalExpenses: 0,
    valor_reserva: 0,
    suma_total_de_puntas: 0,
    honorarios_broker: 0,
    honorarios_asesor: 0,
  },
  items: [],
  isLoading: false,
  error: null,

  setExpenses: (expenses) => set({ expenses }),

  setItems: (items) => set({ items: items }),
  fetchItems: async (userID: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`/api/expenses/user/${userID}`);
      set({ items: response.data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  calculateTotals: () => {
    const { expenses } = get();

    if (expenses.length === 0) {
      set({
        totals: {
          totalAmount: 0,
          totalAmountInDollars: 0,
          totalExpenses: 0,
          valor_reserva: 0,
          suma_total_de_puntas: 0,
          honorarios_broker: 0,
          honorarios_asesor: 0,
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

    set({
      totals: {
        totalAmount,
        totalAmountInDollars,
        totalExpenses,
        valor_reserva: 0,
        suma_total_de_puntas: 0,
        honorarios_broker: 0,
        honorarios_asesor: 0,
      },
    });
  },

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  fetchExpenses: async (userID: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/expenses/user/${userID}`);
      const fetchedExpenses = response.data;
      set({ expenses: fetchedExpenses });
      get().calculateTotals();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateExpense: (id: string, newData: Partial<Expense>) => {
    const { expenses } = get();
    const updatedExpenses = expenses.map((expense) =>
      expense.id === id ? { ...expense, ...newData } : expense
    );
    set({ expenses: updatedExpenses });
  },

  deleteExpense: (id: string) => {
    const { expenses } = get();
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    set({ expenses: updatedExpenses });
    get().calculateTotals();
  },
}));
