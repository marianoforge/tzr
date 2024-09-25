import { Operacion } from "@/types";
import { create } from "zustand";

interface OperationsState {
  operations: Operacion[];
  totals: {
    valor_reserva: number | string;
    porcentaje_honorarios_asesor: number | string;
    honorarios_brutos: number | string;
    valor_neto: number | string;
    mayor_venta_efectuada: number | string;
    promedio_valor_reserva: number | string;
  };
  isLoading: boolean;
  setOperations: (operations: Operacion[]) => void;
  calculateTotals: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useOperationsStore = create<OperationsState>((set, get) => ({
  operations: [],
  totals: {
    valor_reserva: 0,
    porcentaje_honorarios_asesor: 0,
    honorarios_brutos: 0,
    valor_neto: 0,
    mayor_venta_efectuada: 0,
    promedio_valor_reserva: 0,
  },
  isLoading: false,
  setOperations: (operations) => set({ operations }),
  calculateTotals: () => {
    const { operations } = get();

    if (operations.length === 0) {
      set({
        totals: {
          valor_reserva: "No Data",
          porcentaje_honorarios_asesor: "No Data",
          honorarios_brutos: "No Data",
          valor_neto: "No Data",
          mayor_venta_efectuada: "No Data",
          promedio_valor_reserva: "No Data",
        },
      });
      return;
    }

    const totalValorReserva = operations.reduce(
      (acc, op) => acc + op.valor_reserva,
      0
    );

    const totalPorcentajeHonorariosAsesor =
      operations.reduce((acc, op) => acc + op.porcentaje_honorarios_asesor, 0) /
      operations.length;

    const totalHonorariosGDS =
      operations.reduce((acc, op) => acc + op.honorarios_brutos, 0) /
      operations.length;

    const totalValorNeto = operations.reduce(
      (acc, op) => acc + op.valor_neto,
      0
    );

    const mayorVentaEfectuada = Math.max(
      ...operations.map((op) => op.valor_reserva)
    );

    const promedioValorReserva = totalValorReserva / operations.length;

    set({
      totals: {
        valor_reserva: totalValorReserva,
        porcentaje_honorarios_asesor: totalPorcentajeHonorariosAsesor,
        honorarios_brutos: totalHonorariosGDS,
        valor_neto: totalValorNeto,
        mayor_venta_efectuada: mayorVentaEfectuada,
        promedio_valor_reserva: promedioValorReserva,
      },
    });
  },
  setIsLoading: (isLoading) => set({ isLoading }),
}));
