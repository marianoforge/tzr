import { Operation } from '@/common/types';
import { OperationType } from '../enums';

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

const ventasPieChartData = (closedOperations: Operation[]) => {
  return {
    name: OperationType.VENTA,
    value: operacionCerrada2024(closedOperations).filter(
      (op: Operation) => op.tipo_operacion === OperationType.VENTA
    ).length,
  };
};

const alquileresTradicionalesPieChartData = (closedOperations: Operation[]) => {
  return {
    name: OperationType.ALQUILER_TRADICIONAL,
    value: operacionCerrada2024(closedOperations).filter(
      (op: Operation) =>
        op.tipo_operacion === OperationType.ALQUILER_TRADICIONAL
    ).length,
  };
};

const alquileresComercialesPieChartData = (closedOperations: Operation[]) => {
  return {
    name: OperationType.ALQUILER_COMERCIAL,
    value: operacionCerrada2024(closedOperations).filter(
      (op: Operation) => op.tipo_operacion === OperationType.ALQUILER_COMERCIAL
    ).length,
  };
};

const alquileresTemporalesPieChartData = (closedOperations: Operation[]) => {
  return {
    name: OperationType.ALQUILER_TEMPORAL,
    value: operacionCerrada2024(closedOperations).filter(
      (op: Operation) => op.tipo_operacion === OperationType.ALQUILER_TEMPORAL
    ).length,
  };
};
const fondosComercioPieChartData = (closedOperations: Operation[]) => {
  return {
    name: OperationType.FONDO_DE_COMERCIO,
    value: operacionCerrada2024(closedOperations).filter(
      (op: Operation) => op.tipo_operacion === OperationType.FONDO_DE_COMERCIO
    ).length,
  };
};

const desarrolloInmobiliarioPieChartData = (closedOperations: Operation[]) => {
  return {
    name: OperationType.DESARROLLO_INMOBILIARIO,
    value: operacionCerrada2024(closedOperations).filter(
      (op: Operation) =>
        op.tipo_operacion === OperationType.DESARROLLO_INMOBILIARIO
    ).length,
  };
};

export const tiposOperacionesPieChartData = (closedOperations: Operation[]) => {
  return [
    ventasPieChartData(closedOperations),
    alquileresTradicionalesPieChartData(closedOperations),
    alquileresComercialesPieChartData(closedOperations),
    alquileresTemporalesPieChartData(closedOperations),
    fondosComercioPieChartData(closedOperations),
    desarrolloInmobiliarioPieChartData(closedOperations),
  ];
};
