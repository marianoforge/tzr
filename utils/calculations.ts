// calculations.ts
import { Operation } from "@/types";

export const calculateTotals = (operations: Operation[]) => {
  if (operations.length === 0) {
    return {
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
    };
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
      acc + (typeof op.punta_compradora === "number" ? op.punta_compradora : 0),
    0
  );

  const puntaVendedora = operations.reduce(
    (acc, op) =>
      acc + (typeof op.punta_vendedora === "number" ? op.punta_vendedora : 0),
    0
  );

  const sumaTotalDePuntas = puntaCompradora + puntaVendedora;
  const cantidadOperaciones = operations.length;

  return {
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
    totalAmount: 0,
    totalAmountInDollars: 0,
    totalExpenses: 0,
  };
};