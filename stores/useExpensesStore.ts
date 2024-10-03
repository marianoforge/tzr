import { create } from "zustand";
import axios from "axios";
import { Expense, ExpensesState } from "@/types";

// Definir el estado y las funciones de la tienda de gastos

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
  items: [], // Add this line to initialize items
  isLoading: false,
  error: null,

  // Establecer los gastos
  setExpenses: (expenses) => set({ expenses }),

  // Agregar los métodos faltantes
  setItems: (items) => set({ items: items }),
  fetchItems: async (userID: string) => {
    set({ isLoading: true }); // Set isLoading to true
    try {
      const response = await axios.get(`/api/expenses/user/${userID}`);
      set({ items: response.data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false }); // Set isLoading to false
    }
  },

  // Calcular totales
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
