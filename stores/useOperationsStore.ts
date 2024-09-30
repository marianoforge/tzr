import { OperationsState } from "@/types";
import { create } from "zustand";
import axios from "axios";

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
  },
  isLoading: false,
  error: null,
  setOperations: (operations) => set({ operations }),
  calculateTotals: () => {
    const { operations } = get();

    if (operations.length === 0) {
      set({
        totals: {
          valor_reserva: "No Data",
          porcentaje_honorarios_asesor: "No Data",
          porcentaje_honorarios_broker: "No Data",
          honorarios_broker: "No Data",
          honorarios_asesor: "No Data",
          mayor_venta_efectuada: "No Data",
          promedio_valor_reserva: "No Data",
          punta_compradora: "No Data",
          punta_vendedora: "No Data",
          suma_total_de_puntas: "No Data",
          cantidad_operaciones: "No Data",
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

    const totalPorcentajeHonorariosBroker =
      operations.reduce((acc, op) => acc + op.porcentaje_honorarios_broker, 0) /
      operations.length;

    const totalHonorariosGDS = operations.reduce(
      (acc, op) => acc + op.honorarios_broker,
      0
    );

    const totalHonorariosNetos = operations.reduce(
      (acc, op) => acc + op.honorarios_asesor,
      0
    );

    const mayorVentaEfectuada = Math.max(
      ...operations.map((op) => op.valor_reserva)
    );

    const promedioValorReserva = totalValorReserva / operations.length;

    const puntaCompradora = operations.reduce(
      (acc, op) =>
        acc +
        (typeof op.punta_compradora === "number" ? op.punta_compradora : 0),
      0
    );

    const puntaVendedora = operations.reduce(
      (acc, op) =>
        acc + (typeof op.punta_vendedora === "number" ? op.punta_vendedora : 0),
      0
    );

    const sumaTotalDePuntas = puntaCompradora + puntaVendedora;
    const cantidadOperaciones = operations.length;
    set({
      totals: {
        valor_reserva: totalValorReserva,
        porcentaje_honorarios_asesor: totalPorcentajeHonorariosAsesor,
        porcentaje_honorarios_broker: totalPorcentajeHonorariosBroker,
        honorarios_broker: totalHonorariosGDS,
        honorarios_asesor: totalHonorariosNetos,
        mayor_venta_efectuada: mayorVentaEfectuada,
        promedio_valor_reserva: promedioValorReserva,
        punta_compradora: puntaCompradora,
        punta_vendedora: puntaVendedora,
        suma_total_de_puntas: sumaTotalDePuntas,
        cantidad_operaciones: cantidadOperaciones,
      },
    });
  },
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  fetchOperations: async (userID: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/operations/user/${userID}`);
      const fetchedOperations = response.data;
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
    const updatedOperations = operations.map((op) =>
      op.id === id ? { ...op, estado: newEstado } : op
    );
    set({ operations: updatedOperations });
  },
}));
