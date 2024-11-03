import { Operation } from '@/common/types';
import { calculateGrossByMonth } from './calculationsGrossByMonth';
import {
  ALQUILER,
  OperationData,
  OperationStatus,
  OperationType,
} from '../enums';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

// Funcion para sumatoria de un campo en operaciones
const sumField = (operations: Operation[], field: keyof Operation) =>
  operations.reduce((acc, op) => acc + (Number(op[field]) || 0), 0);

// Funcion para calcular el promedio de un campo en operaciones
const averageField = (operations: Operation[], field: keyof Operation) =>
  operations.length > 0 ? sumField(operations, field) / operations.length : 0;

// Funcion para filtrar operaciones por tipo
const filterOperationsByType = (operations: Operation[], type: string) =>
  operations.filter((op) => op.tipo_operacion === type);

// Funcion para filtrar operaciones excluyendo un tipo
const filterOperationsExcludingType = (operations: Operation[], type: string) =>
  operations.filter((op) => !op.tipo_operacion.includes(type));

// Calculo de honorarios basado en el valor de reserva y porcentajes
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

// Calculos de totales para operaciones
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

  // Total Valores Ventas y Ventas Cerradas
  const totalValorReserva = sumField(operations, OperationData.VALOR_RESERVA);

  const totalValorReservaCerradas = sumField(
    operations.filter((op) => op.estado === OperationStatus.CERRADA),
    OperationData.VALOR_RESERVA
  );

  const totalValorReservaEnCurso = sumField(
    operations.filter((op) => op.estado === OperationStatus.EN_CURSO),
    OperationData.VALOR_RESERVA
  );

  // Total Valores Ventas y Desarrollos Cerrados
  const filteredOperations = filterOperationsByType(
    operations,
    OperationType.VENTA
  )
    .concat(
      filterOperationsByType(operations, OperationType.DESARROLLO_INMOBILIARIO)
    )
    .filter((op) => op.estado === OperationStatus.CERRADA);

  // Total Promedio Valor Reservas Filtradas para Ventas y Desarrollos
  const totalValorReservaFiltered = averageField(
    filteredOperations,
    OperationData.VALOR_RESERVA
  );

  // Total Promedio Porcentaje Honorarios Asesor
  const totalPorcentajeHonorariosAsesor = averageField(
    operations,
    OperationData.PORCENTAJE_HONORARIOS_ASESOR
  );

  // Total Promedio Porcentaje Honorarios Broker
  const totalPorcentajeHonorariosBroker = averageField(
    operations,
    OperationData.PORCENTAJE_HONORARIOS_BROKER
  );

  // Total Honorarios Broker
  const totalHonorariosBroker = sumField(
    operations,
    OperationData.HONORARIOS_BROKER
  );

  // Total Honorarios Asesor
  const totalHonorariosAsesor = sumField(
    operations,
    OperationData.HONORARIOS_ASESOR
  );

  // Total Honorarios Asesor Cerradas
  const totalHonorariosAsesorCerradas = sumField(
    operations.filter((op) => op.estado === OperationStatus.CERRADA),
    OperationData.HONORARIOS_ASESOR
  );

  const totalHonorariosAsesorMesVencido = sumField(
    operations.filter((op) => {
      const operationDate = new Date(op.fecha_operacion); // Assuming 'fecha' is the date field in Operation
      const operationYear = operationDate.getFullYear();
      const operationMonth = operationDate.getMonth() + 1;
      return (
        op.estado === OperationStatus.CERRADA &&
        operationYear === currentYear &&
        operationMonth < currentMonth
      );
    }),
    OperationData.HONORARIOS_ASESOR
  );

  const totalHonorariosAsesorMesVencidoPromedio =
    totalHonorariosAsesorMesVencido / (currentMonth - 1);

  // Total Honorarios Broker Cerradas
  const totalHonorariosBrokerCerradas = sumField(
    operations.filter((op) => op.estado === OperationStatus.CERRADA),
    OperationData.HONORARIOS_BROKER
  );

  // Total Honorarios Broker Abiertas
  const totalHonorariosBrokerAbiertas = sumField(
    operations.filter((op) => op.estado === OperationStatus.EN_CURSO),
    OperationData.HONORARIOS_BROKER
  );

  // Total Honorarios Asesor Abiertas
  const totalHonorariosAsesorAbiertas = sumField(
    operations.filter((op) => op.estado === OperationStatus.EN_CURSO),
    OperationData.HONORARIOS_ASESOR
  );

  // Mayor Valor Reserva Efectuada
  const mayorVentaEfectuada = Math.max(
    ...operations.map((op) => op.valor_reserva)
  );

  // Promedio Valor Reserva
  const promedioValorReserva = totalValorReserva / operations.length;

  // Operaciones Cerradas
  const closedOperations = operations.filter(
    (op) => op.estado === OperationStatus.CERRADA
  );

  // Total Punta Compradora
  const puntaCompradora = closedOperations.reduce((sum, operation) => {
    return sum + (operation.porcentaje_punta_compradora ? 1 : 0);
  }, 0);

  const puntaVendedora = closedOperations.reduce((sum, operation) => {
    return sum + (operation.porcentaje_punta_vendedora ? 1 : 0);
  }, 0);

  // Total Suma Total de Puntas
  const sumaTotalDePuntas = puntaCompradora + puntaVendedora;

  // Cantidad Operaciones Cerradas
  const cantidadOperaciones = operations.filter(
    (op) => op.estado === OperationStatus.CERRADA
  ).length;

  // Operaciones sin Alquileres
  const filtroOperacionsSinAlquileres = filterOperationsExcludingType(
    operations,
    ALQUILER.ALQUILER
  ).filter((op) => op.estado === OperationStatus.CERRADA);

  // Total Punta Compradora Porcentaje
  const totalPuntaCompradoraPorcentaje = sumField(
    filteredOperations,
    OperationData.PORCENTAJE_PUNTA_COMPRADORA
  );

  // Total Punta Vendedora Porcentaje
  const totalPuntaVendedoraPorcentaje = sumField(
    filteredOperations,
    OperationData.PORCENTAJE_PUNTA_VENDEDORA
  );

  // Operaciones Punta Compradora Valida !== null && !== 0
  const validPuntaCompradoraOperations = filteredOperations.filter(
    (op) =>
      op.porcentaje_punta_compradora !== null &&
      op.porcentaje_punta_compradora !== 0
  );

  // Operaciones Punta Vendedora Valida !== null && !== 0
  const validPuntaVendedoraOperations = filteredOperations.filter(
    (op) =>
      op.porcentaje_punta_vendedora !== null &&
      op.porcentaje_punta_vendedora !== 0
  );

  // Promedio Punta Compradora Porcentaje
  const promedioPuntaCompradoraPorcentaje =
    validPuntaCompradoraOperations.length > 0
      ? totalPuntaCompradoraPorcentaje / validPuntaCompradoraOperations.length
      : 0;

  // Promedio Punta Vendedora Porcentaje
  const promedioPuntaVendedoraPorcentaje =
    validPuntaVendedoraOperations.length > 0
      ? totalPuntaVendedoraPorcentaje / validPuntaVendedoraOperations.length
      : 0;

  const totalPromedioPorcentajePuntasValidas =
    (promedioPuntaCompradoraPorcentaje + promedioPuntaVendedoraPorcentaje) / 2;

  // Total Honorarios Broker Ajustados para operaciones dobles
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

  // Obtener el mes actual (1-12)

  // Promedio Mensual Honorarios Asesor
  const promedioMensualHonorariosAsesor =
    totalHonorariosAsesorCerradas / currentMonth;

  // Filtrar operaciones donde ambas puntas son distintas de cero
  const validOperations = filtroOperacionsSinAlquileres.filter(
    (op) => Number(op.punta_compradora) + Number(op.punta_vendedora) > 1
  );

  const validOperationsTotalValorReserva = sumField(
    validOperations,
    OperationData.VALOR_RESERVA
  );

  const validOperationsTotalHonorariosBroker = sumField(
    validOperations,
    OperationData.HONORARIOS_BROKER
  );
  // Calcular la suma de las puntas compradora y vendedora
  const totalPuntaCompradoraPorcentajeDevVentas = sumField(
    validOperations,
    OperationData.PORCENTAJE_PUNTA_COMPRADORA
  );

  const totalPuntaVendedoraPorcentajeDevVentas = sumField(
    validOperations,
    OperationData.PORCENTAJE_PUNTA_VENDEDORA
  );

  // Calcular el promedio de la suma de las puntas
  const promedioSumaPuntas =
    (totalPuntaCompradoraPorcentajeDevVentas +
      totalPuntaVendedoraPorcentajeDevVentas) /
    validOperations.length;

  // Calculate the percentage for each month
  const porcentajeHonorariosBrokerPorMes2024 = calculateGrossByMonth(
    validOperations,
    2024
  );

  const porcentajeHonorariosBrokerPorMes2023 = calculateGrossByMonth(
    validOperations,
    2023
  );

  return {
    valor_reserva: totalValorReserva,
    valor_reserva_en_curso: totalValorReservaEnCurso,
    porcentaje_honorarios_asesor: totalPorcentajeHonorariosAsesor,
    porcentaje_honorarios_broker: totalPorcentajeHonorariosBroker,
    honorarios_broker: totalHonorariosBroker,
    honorarios_asesor: totalHonorariosAsesor,
    honorarios_asesor_cerradas: totalHonorariosAsesorCerradas,
    honorarios_broker_cerradas: totalHonorariosBrokerCerradas,
    honorarios_broker_abiertas: totalHonorariosBrokerAbiertas,
    honorarios_asesor_abiertas: totalHonorariosAsesorAbiertas,
    mayor_venta_efectuada: mayorVentaEfectuada,
    promedio_valor_reserva: promedioValorReserva,
    punta_compradora: puntaCompradora,
    punta_vendedora: puntaVendedora,
    suma_total_de_puntas: sumaTotalDePuntas,
    cantidad_operaciones: cantidadOperaciones,
    promedio_punta_compradora_porcentaje: promedioPuntaCompradoraPorcentaje,
    promedio_punta_vendedora_porcentaje: promedioPuntaVendedoraPorcentaje,
    total_valor_ventas_desarrollos: totalValorReservaFiltered,
    valor_reserva_cerradas: totalValorReservaCerradas,
    total_honorarios_broker_adjusted: totalHonorariosBrokerAdjusted,
    promedio_mensual_honorarios_asesor: promedioMensualHonorariosAsesor,
    total_promedio_porcentaje_puntas_validas:
      totalPromedioPorcentajePuntasValidas,
    promedio_suma_puntas: promedioSumaPuntas,
    total_honorarios_asesor_mes_vencido_promedio:
      totalHonorariosAsesorMesVencidoPromedio,
    porcentaje_honorarios_broker_por_mes_2024:
      porcentajeHonorariosBrokerPorMes2024,
    porcentaje_honorarios_broker_por_mes_2023:
      porcentajeHonorariosBrokerPorMes2023,
  };
};
