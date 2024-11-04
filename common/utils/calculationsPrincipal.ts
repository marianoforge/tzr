import { Operation } from '@/common/types';
import { OperationType } from '../enums';
import { OperationStatus } from '../enums';

//TABLE//

export const calculateOperationData = (closedOperations: Operation[]) => {
  return closedOperations.reduce(
    (
      acc: Record<
        string,
        { cantidad: number; totalHonorarios: number; totalVenta: number }
      >,
      op: Operation
    ) => {
      if (new Date(op.fecha_operacion).getFullYear() !== 2024) {
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

export const calculateTotalCantidad = (
  operationData: Record<string, { cantidad: number }>
) => {
  return Object.values(operationData).reduce(
    (acc, data) => acc + data.cantidad,
    0
  );
};

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
  return closedOperations
    .filter(
      (op: Operation) => new Date(op.fecha_operacion).getFullYear() === 2024
    )
    .filter((op: Operation) => op.estado === 'Cerrada');
};

const operacionCaida2024 = (operations: Operation[]) => {
  return operations
    .filter(
      (op: Operation) => new Date(op.fecha_operacion).getFullYear() === 2024
    )
    .filter((op: Operation) => op.estado === 'Caída');
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
