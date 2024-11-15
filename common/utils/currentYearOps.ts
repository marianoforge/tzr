import { OperationStatus } from '../enums';

import { Operation } from '@/common/types';

const currentYear = new Date().getFullYear();

export const currentYearOperations = (operations: Operation[]) =>
  operations.filter((operation: Operation) => {
    const operationYear = new Date(operation.fecha_operacion).getFullYear();
    return operationYear === currentYear;
  });

const getOperationsByMonth = (
  operations: Operation[],
  targetYear: number,
  status: OperationStatus
): { [key: string]: number } => {
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const monthlyTotals: { [key: number]: number } = operations
    .filter((operation) => {
      const operationYear = new Date(operation.fecha_operacion).getFullYear();
      return operationYear === targetYear && operation.estado === status;
    })
    .reduce(
      (acc: { [key: number]: number }, operation) => {
        const monthIndex = new Date(operation.fecha_operacion).getMonth();
        acc[monthIndex] = (acc[monthIndex] || 0) + operation.honorarios_broker;
        return acc;
      },
      {} as { [key: number]: number }
    );

  // Convertimos el resultado a un objeto con los nombres de los meses
  const result: { [key: string]: number } = {};
  monthNames.forEach((month, index) => {
    result[month] = monthlyTotals[index] || 0;
  });

  return result;
};

// Función para calcular operaciones cerradas
export const closedOperationsByMonth2024 = (operations: Operation[]) => {
  const targetYear = new Date().getFullYear();
  const monthlyResults = getOperationsByMonth(
    operations,
    targetYear,
    OperationStatus.CERRADA
  );

  let cumulativeSum = 0;
  const cumulativeResults: { [key: string]: number } = {};
  Object.keys(monthlyResults).forEach((month) => {
    cumulativeSum += monthlyResults[month];
    cumulativeResults[month] = parseFloat(cumulativeSum.toFixed(2));
  });

  return cumulativeResults;
};

// Función para calcular operaciones abiertas
export const openOperationsByMonth2024 = (operations: Operation[]) => {
  const targetYear = new Date().getFullYear();
  const monthlyResults = getOperationsByMonth(
    operations,
    targetYear,
    OperationStatus.EN_CURSO
  );

  // Sumamos todos los valores de monthlyResults
  const totalSum = Object.values(monthlyResults).reduce(
    (acc, value) => acc + value,
    0
  );

  return parseFloat(totalSum.toFixed(2));
};
export const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
