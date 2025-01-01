import { OperationType, OperationStatus } from '../enums';

import { Operation } from '@/common/types';

//TABLE//

export const calculateOperationData = (closedOperations: Operation[]) => {
  const currentYear = new Date().getFullYear();
  return closedOperations.reduce(
    (
      acc: Record<
        string,
        { cantidad: number; totalHonorarios: number; totalVenta: number }
      >,
      op: Operation
    ) => {
      if (new Date(op.fecha_operacion).getFullYear() !== currentYear) {
        return acc;
      }

      if (!acc[op.tipo_operacion]) {
        acc[op.tipo_operacion] = {
          cantidad: 0,
          totalHonorarios: 0,
          totalVenta: 0,
        };
      }
      acc[op.tipo_operacion].cantidad += 1;
      acc[op.tipo_operacion].totalHonorarios += Number(op.honorarios_broker);
      acc[op.tipo_operacion].totalVenta += Number(op.valor_reserva);
      return acc;
    },
    {} as Record<
      string,
      { cantidad: number; totalHonorarios: number; totalVenta: number }
    >
  );
};

//

export const calculateTotalLastColumnSum = (
  operationData: Record<string, { totalVenta: number; cantidad: number }>
) => {
  return Object.entries(operationData).reduce((acc, [tipo, data]) => {
    if (
      ![
        'Alquiler',
        'Cochera',
        'Alquiler Temporal',
        'Alquiler Tradicional',
        'Alquiler Comercial',
        'Locales Comerciales',
        'Fondo de Comercio',
        'Lotes Para Desarrollos',
      ].includes(tipo)
    ) {
      return acc + data.totalVenta / data.cantidad;
    }
    return acc;
  }, 0);
};

export const calculatePercentage = (part: number, total: number) =>
  ((part / total) * 100).toFixed(2);

//CHART DATA//
const operacionCerrada2024 = (closedOperations: Operation[]) => {
  const currentYear = new Date().getFullYear();
  return closedOperations
    .filter(
      (op: Operation) =>
        new Date(op.fecha_operacion).getFullYear() === currentYear
    )
    .filter((op: Operation) => op.estado === OperationStatus.CERRADA);
};

const operacionCaida2024 = (operations: Operation[]) => {
  const currentYear = new Date().getFullYear();
  return operations
    .filter(
      (op: Operation) =>
        new Date(op.fecha_operacion).getFullYear() === currentYear
    )
    .filter((op: Operation) => op.estado === OperationStatus.CAIDA);
};

const pieChartData = (
  closedOperations: Operation[],
  operationType: OperationType
) => {
  return {
    name: operationType,
    value: operacionCerrada2024(closedOperations).filter(
      (op: Operation) => op.tipo_operacion === operationType
    ).length,
  };
};

const pieChartDataFallen = (
  operations: Operation[],
  operationType: OperationType
) => {
  return {
    name: operationType,
    value: operacionCaida2024(operations).filter(
      (op: Operation) => op.tipo_operacion === operationType
    ).length,
  };
};

export const tiposOperacionesPieChartData = (closedOperations: Operation[]) => {
  return [
    pieChartData(closedOperations, OperationType.VENTA),
    pieChartData(closedOperations, OperationType.ALQUILER_TRADICIONAL),
    pieChartData(closedOperations, OperationType.ALQUILER_COMERCIAL),
    pieChartData(closedOperations, OperationType.ALQUILER_TEMPORAL),
    pieChartData(closedOperations, OperationType.FONDO_DE_COMERCIO),
    pieChartData(closedOperations, OperationType.DESARROLLO_INMOBILIARIO),
  ];
};

export const tiposOperacionesCaidasPieChartData = (operations: Operation[]) => {
  return [
    pieChartDataFallen(operations, OperationType.VENTA),
    pieChartDataFallen(operations, OperationType.ALQUILER_TRADICIONAL),
    pieChartDataFallen(operations, OperationType.ALQUILER_COMERCIAL),
    pieChartDataFallen(operations, OperationType.ALQUILER_TEMPORAL),
    pieChartDataFallen(operations, OperationType.FONDO_DE_COMERCIO),
    pieChartDataFallen(operations, OperationType.DESARROLLO_INMOBILIARIO),
  ];
};

export const calculateClosedOperations2024SummaryByType = (
  closedOperations: Operation[]
) => {
  const currentYear = new Date().getFullYear();
  const filteredOperations = closedOperations.filter(
    (op: Operation) =>
      new Date(op.fecha_operacion).getFullYear() === currentYear &&
      op.estado === OperationStatus.CERRADA
  );

  const summaryByType = filteredOperations.reduce(
    (acc, op) => {
      if (!acc[op.tipo_operacion]) {
        acc[op.tipo_operacion] = {
          totalHonorariosBrutos: 0,
          totalMontoVentasReserva: 0,
          cantidadOperaciones: 0,
        };
      }

      acc[op.tipo_operacion].totalHonorariosBrutos += Number(
        op.honorarios_broker
      );
      acc[op.tipo_operacion].totalMontoVentasReserva += Number(
        op.valor_reserva
      );
      acc[op.tipo_operacion].cantidadOperaciones += 1;

      return acc;
    },
    {} as Record<
      string,
      {
        totalHonorariosBrutos: number;
        totalMontoVentasReserva: number;
        cantidadOperaciones: number;
      }
    >
  );

  return summaryByType;
};

export const calculateClosedOperations2024SummaryByGroup = (
  closedOperations: Operation[]
) => {
  const currentYear = new Date().getFullYear();
  const filteredOperations = closedOperations.filter(
    (op: Operation) =>
      new Date(op.fecha_operacion).getFullYear() === currentYear &&
      op.estado === OperationStatus.CERRADA
  );

  const totalMontoHonorariosBroker = filteredOperations.reduce(
    (acc, op) => acc + Number(op.honorarios_broker),
    0
  );

  const summaryByGroup = filteredOperations.reduce(
    (acc, op) => {
      let groupKey: string;
      let operationType: string;

      switch (op.tipo_operacion) {
        case OperationType.VENTA:
          groupKey = 'Venta';
          operationType = OperationType.VENTA;
          break;
        case OperationType.FONDO_DE_COMERCIO:
          groupKey = 'Fondo de Comercio';
          operationType = OperationType.FONDO_DE_COMERCIO;
          break;
        case OperationType.ALQUILER_TRADICIONAL:
          groupKey = 'Alquiler Tradicional';
          operationType = OperationType.ALQUILER_TRADICIONAL;
          break;
        case OperationType.DESARROLLO_INMOBILIARIO:
          groupKey = 'Desarrollo Inmobiliario';
          operationType = OperationType.DESARROLLO_INMOBILIARIO;
          break;
        case OperationType.ALQUILER_TEMPORAL:
          groupKey = 'Alquiler Temporal';
          operationType = OperationType.ALQUILER_TEMPORAL;
          break;
        case OperationType.ALQUILER_COMERCIAL:
          groupKey = 'Alquiler Comercial';
          operationType = OperationType.ALQUILER_COMERCIAL;
          break;
        default:
          return acc;
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          totalHonorariosBrutos: 0,
          cantidadOperaciones: 0,
          totalMontoOperaciones: 0,
          operationType,
        };
      }

      acc[groupKey].totalHonorariosBrutos += Number(op.honorarios_broker);
      acc[groupKey].cantidadOperaciones += 1;
      acc[groupKey].totalMontoOperaciones += Number(op.valor_reserva);

      return acc;
    },
    {} as Record<
      string,
      {
        totalHonorariosBrutos: number;
        cantidadOperaciones: number;
        totalMontoOperaciones: number;
        operationType: string;
      }
    >
  );

  const summaryArray = Object.entries(summaryByGroup).map(([group, data]) => ({
    group,
    ...data,
  }));

  const groupKeys = Object.keys(summaryByGroup);

  return { summaryArray, totalMontoHonorariosBroker, groupKeys };
};
