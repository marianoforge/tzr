import { create } from "zustand";
import { OperationsState, Operation } from "@/types";
import { calculateTotals } from "@/utils/calculations";
import { fetchOperations, updateOperationStatus } from "@/utils/operationsApi";

export const useOperationsStore = create<OperationsState>((set, get) => ({
  operations: [],
  totals: {
    valor_reserva: 0,
    porcentaje_honorarios_asesor: 0,
    porcentaje_honorarios_broker: 0,
    honorarios_broker: 0,
    honorarios_asesor: 0,
    mayor_venta_efectuada: 0,
    promedio_valor_reserva: 0,
    punta_compradora: 0,
    punta_vendedora: 0,
    suma_total_de_puntas: 0,
    cantidad_operaciones: 0,
    totalAmount: 0,
    totalAmountInDollars: 0,
    totalExpenses: 0,
  },
  isLoading: false,
  error: null,

  setItems: (operations: Operation[]) => {
    set({ operations });
    get().calculateTotals();
  },

  calculateTotals: () => {
    const { operations } = get();
    const totals = calculateTotals(operations);
    set({ totals });
  },

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  fetchItems: async (userID: string) => {
    set({ isLoading: true, error: null });
    try {
      const fetchedOperations = await fetchOperations(userID);
      set({ operations: fetchedOperations });
      get().calculateTotals();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateOperationEstado: (id: string, newEstado: string) => {
    const { operations } = get();
    const updatedOperations = updateOperationStatus(operations, id, newEstado);
    set({ operations: updatedOperations });
  },
}));
