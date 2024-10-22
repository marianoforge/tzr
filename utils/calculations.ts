import { Operation } from "@/types";

// Utility function to sum a specific field in operations
const sumField = (operations: Operation[], field: keyof Operation) =>
  operations.reduce((acc, op) => acc + (Number(op[field]) || 0), 0);

// Utility function to calculate average of a specific field
const averageField = (operations: Operation[], field: keyof Operation) =>
  operations.length > 0 ? sumField(operations, field) / operations.length : 0;

// Utility function to filter operations by type
const filterOperationsByType = (operations: Operation[], type: string) =>
  operations.filter((op) => op.tipo_operacion === type);

// Utility function to filter operations excluding a type
const filterOperationsExcludingType = (operations: Operation[], type: string) =>
  operations.filter((op) => !op.tipo_operacion.includes(type));

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
      honorarios_asesor_adicional: 0,
      porcentaje_honorarios_asesor_adicional: 0,
    };
  }

  //Calculos Doblete

  //Fin Calculos Doblete

  const totalValorReserva = sumField(operations, "valor_reserva");
  const totalValorReservaCerradas = sumField(
    operations.filter((op) => op.estado === "Cerrada"),
    "valor_reserva"
  );

  const filteredOperations = filterOperationsByType(operations, "Venta")
    .concat(filterOperationsByType(operations, "Desarrollo"))
    .filter((op) => op.estado === "Cerrada");

  const totalValorReservaFiltered = averageField(
    filteredOperations,
    "valor_reserva"
  );

  const totalPorcentajeHonorariosAsesor = averageField(
    operations,
    "porcentaje_honorarios_asesor"
  );
  const totalPorcentajeHonorariosBroker = averageField(
    operations,
    "porcentaje_honorarios_broker"
  );
  const totalHonorariosBroker = sumField(operations, "honorarios_broker");
  const totalHonorariosAsesor = sumField(operations, "honorarios_asesor");

  const totalHonorariosAsesorCerradas = sumField(
    operations.filter((op) => op.estado === "Cerrada"),
    "honorarios_asesor"
  );

  const totalHonorariosBrokerCerradas = sumField(
    operations.filter((op) => op.estado === "Cerrada"),
    "honorarios_broker"
  );

  const mayorVentaEfectuada = Math.max(
    ...operations.map((op) => op.valor_reserva)
  );
  const promedioValorReserva = totalValorReserva / operations.length;

  const closedOperations = operations.filter((op) => op.estado === "Cerrada");

  const puntaCompradora = sumField(closedOperations, "punta_compradora");
  const puntaVendedora = sumField(closedOperations, "punta_vendedora");

  const sumaTotalDePuntas = puntaCompradora + puntaVendedora;

  const cantidadOperaciones = operations.filter(
    (op) => op.estado === "Cerrada"
  ).length;

  const filtroOperacionsSinAlquileres = filterOperationsExcludingType(
    operations,
    "Alquiler"
  );

  const totalPuntaCompradoraPorcentaje = sumField(
    filtroOperacionsSinAlquileres,
    "porcentaje_punta_compradora"
  );
  const totalPuntaVendedoraPorcentaje = sumField(
    filtroOperacionsSinAlquileres,
    "porcentaje_punta_vendedora"
  );

  const validPuntaCompradoraOperations = filtroOperacionsSinAlquileres.filter(
    (op) => op.porcentaje_punta_compradora !== null
  );

  const validPuntaVendedoraOperations = filtroOperacionsSinAlquileres.filter(
    (op) => op.porcentaje_punta_vendedora !== null
  );

  const promedioPuntaCompradoraPorcentaje =
    validPuntaCompradoraOperations.length > 0
      ? totalPuntaCompradoraPorcentaje / validPuntaCompradoraOperations.length
      : 0;

  const promedioPuntaVendedoraPorcentaje =
    validPuntaVendedoraOperations.length > 0
      ? totalPuntaVendedoraPorcentaje / validPuntaVendedoraOperations.length
      : 0;

  const totalHonorariosBrokerAdjusted = operations.reduce(
    (acc: number, op: Operation) => {
      const isHalfOperation =
        op.user_uid &&
        op.user_uid_adicional &&
        op.user_uid !== op.user_uid_adicional;
      return acc + op.honorarios_broker * (isHalfOperation ? 0.5 : 1);
    },
    0
  );

  return {
    valor_reserva: totalValorReserva,
    porcentaje_honorarios_asesor: totalPorcentajeHonorariosAsesor,
    porcentaje_honorarios_broker: totalPorcentajeHonorariosBroker,
    honorarios_broker: totalHonorariosBroker,
    honorarios_asesor: totalHonorariosAsesor,
    honorarios_asesor_cerradas: totalHonorariosAsesorCerradas,
    honorarios_broker_cerradas: totalHonorariosBrokerCerradas,
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
    valor_reserva_cerradas: totalValorReservaCerradas,
    total_honorarios_broker_adjusted: totalHonorariosBrokerAdjusted,
  };
};
