import { Operation } from "@/types";

// Cálculo de honorarios basado en el valor de reserva y porcentajes
export const calculateHonorarios = (
  valor_reserva: number,
  porcentaje_honorarios_asesor: number,
  porcentaje_honorarios_broker: number
) => {
  const honorariosBroker = (valor_reserva * porcentaje_honorarios_broker) / 100;
  const honorariosAsesor =
    (valor_reserva *
      porcentaje_honorarios_broker *
      porcentaje_honorarios_asesor) /
    10000;

  return { honorariosBroker, honorariosAsesor };
};

// Cálculos de totales para operaciones
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
    };
  }

  const totalValorReserva = operations.reduce(
    (acc, op) => acc + op.valor_reserva,
    0
  );

  const filteredOperations = operations.filter(
    (op) => op.tipo_operacion === "Venta" || op.tipo_operacion === "Desarrollo"
  );

  const totalValorReservaFiltered = filteredOperations.reduce(
    (acc, op) => acc + op.valor_reserva,
    0
  );

  const totalPorcentajeHonorariosAsesor =
    operations.reduce((acc, op) => acc + op.porcentaje_honorarios_asesor, 0) /
    operations.length;

  const totalPorcentajeHonorariosBroker =
    operations.reduce((acc, op) => acc + op.porcentaje_honorarios_broker, 0) /
    operations.length;

  const totalHonorariosBroker = operations.reduce(
    (acc, op) => acc + op.honorarios_broker,
    0
  );

  const totalHonorariosAsesor = operations.reduce(
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
      (typeof op.punta_compradora === "number"
        ? op.punta_compradora
        : Number(op.punta_compradora)),
    0
  );

  const puntaVendedora = operations.reduce(
    (acc, op) =>
      acc +
      (typeof op.punta_vendedora === "number"
        ? op.punta_vendedora
        : Number(op.punta_vendedora)),
    0
  );

  const sumaTotalDePuntas = puntaCompradora + puntaVendedora;
  const cantidadOperaciones = operations.length;

  const totalPuntaCompradoraPorcentaje = operations.reduce(
    (acc, op) => acc + (op.porcentaje_punta_compradora || 0),
    0
  );

  const totalPuntaVendedoraPorcentaje = operations.reduce(
    (acc, op) => acc + (op.porcentaje_punta_vendedora || 0),
    0
  );

  const promedioPuntaCompradoraPorcentaje =
    totalPuntaCompradoraPorcentaje / operations.length;

  const promedioPuntaVendedoraPorcentaje =
    operations.length > 0
      ? totalPuntaVendedoraPorcentaje / operations.length
      : 0;

  return {
    valor_reserva: totalValorReserva,
    porcentaje_honorarios_asesor: totalPorcentajeHonorariosAsesor,
    porcentaje_honorarios_broker: totalPorcentajeHonorariosBroker,
    honorarios_broker: totalHonorariosBroker,
    honorarios_asesor: totalHonorariosAsesor,
    mayor_venta_efectuada: mayorVentaEfectuada,
    promedio_valor_reserva: promedioValorReserva,
    punta_compradora: puntaCompradora,
    punta_vendedora: puntaVendedora,
    suma_total_de_puntas: sumaTotalDePuntas,
    cantidad_operaciones: cantidadOperaciones,
    promedio_punta_compradora: puntaCompradora / operations.length,
    promedio_punta_vendedora: promedioPuntaVendedoraPorcentaje,
    promedio_punta_compradora_porcentaje: promedioPuntaCompradoraPorcentaje,
    promedio_punta_vendedora_porcentaje: promedioPuntaVendedoraPorcentaje,
    total_valor_ventas_desarrollos: totalValorReservaFiltered,
  };
};
