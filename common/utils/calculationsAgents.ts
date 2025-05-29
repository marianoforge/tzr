import { Operation } from '@/common/types';
import { calculateTotalHonorariosBroker } from '@/common/utils/calculations';

import { OperationStatus, OperationType } from '../enums';

// Function to calculate adjusted broker fees
export const calculateAdjustedBrokerFees = (
  operations: Operation[],
  year: number | string,
  month: string = 'all'
) => {
  // Filtrar operaciones por año y estado
  const filteredOperations = operations.filter((op) => {
    const operationDate = new Date(
      op.fecha_operacion || op.fecha_reserva || ''
    );
    const operationYear = operationDate.getFullYear();
    const operationMonth = (operationDate.getMonth() + 1).toString();

    return (
      op.estado === OperationStatus.CERRADA &&
      (year === 'all' || operationYear === Number(year)) &&
      (month === 'all' || operationMonth === month)
    );
  });

  // Ahora dividimos los honorarios entre asesores cuando es necesario
  return filteredOperations.reduce((acc: number, op: Operation) => {
    const isHalfOperation =
      op.user_uid &&
      op.user_uid_adicional &&
      op.user_uid !== op.user_uid_adicional;

    // Calculamos la contribución de esta operación al total
    const contribucion = calculateTotalHonorariosBroker([op]);

    // Añadimos la contribución ajustada según si es operación compartida
    return acc + contribucion * (isHalfOperation ? 0.5 : 1);
  }, 0);
};

// Function to calculate total operations
export const calculateTotalOperations = (
  operations: Operation[],
  year: number | string,
  month: string = 'all'
) =>
  operations.filter((op) => {
    const operationDate = new Date(
      op.fecha_operacion || op.fecha_reserva || ''
    );
    const operationYear = operationDate.getFullYear();
    const operationMonth = (operationDate.getMonth() + 1).toString();

    return (
      op.estado === OperationStatus.CERRADA &&
      (year === 'all' || operationYear === Number(year)) &&
      (month === 'all' || operationMonth === month)
    );
  }).length;

// Function to calculate total buyer tips
export const calculateTotalBuyerTips = (
  operations: Operation[],
  year: number | string,
  month: string = 'all'
) =>
  operations
    .filter((op) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ''
      );
      const operationYear = operationDate.getFullYear();
      const operationMonth = (operationDate.getMonth() + 1).toString();

      return (
        op.estado === OperationStatus.CERRADA &&
        (year === 'all' || operationYear === Number(year)) &&
        (month === 'all' || operationMonth === month)
      );
    })
    .reduce((acc, op) => acc + (op.punta_compradora ? 1 : 0), 0);

// Function to calculate total seller tips
export const calculateTotalSellerTips = (
  operations: Operation[],
  year: number | string,
  month: string = 'all'
) =>
  operations
    .filter((op) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ''
      );
      const operationYear = operationDate.getFullYear();
      const operationMonth = (operationDate.getMonth() + 1).toString();

      return (
        op.estado === OperationStatus.CERRADA &&
        (year === 'all' || operationYear === Number(year)) &&
        (month === 'all' || operationMonth === month)
      );
    })
    .reduce((acc, op) => acc + (op.punta_vendedora ? 1 : 0), 0);

// Function to calculate total tips
export const calculateTotalTips = (
  operations: Operation[],
  year: number | string,
  userId: string,
  month: string = 'all'
) =>
  operations
    .filter((op) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ''
      );
      const operationYear = operationDate.getFullYear();
      const operationMonth = (operationDate.getMonth() + 1).toString();

      return (
        op.estado === OperationStatus.CERRADA &&
        (year === 'all' || operationYear === Number(year)) &&
        (month === 'all' || operationMonth === month)
      );
    })
    .reduce((acc, op) => {
      let puntas = 0;
      const totalPuntas =
        (op.punta_compradora ? 1 : 0) + (op.punta_vendedora ? 1 : 0);

      if (op.user_uid === userId && op.user_uid_adicional === userId) {
        // 🚀 Si el usuario está como principal y adicional (caso raro), sumar todo
        puntas += totalPuntas;
      } else if (op.user_uid === userId || op.user_uid_adicional === userId) {
        if (op.user_uid_adicional) {
          // 🚀 Si hay dos asesores, cada uno recibe +1 (en vez de asignar todas las puntas a uno solo)
          puntas += 1;
        } else {
          // 🚀 Si solo hay un asesor, se lleva todas las puntas
          puntas += totalPuntas;
        }
      }

      return acc + puntas;
    }, 0);

// Function to calculate total reservation value
export const calculateTotalReservationValue = (
  operations: Operation[],
  year: number | string,
  month: string = 'all'
) =>
  operations
    .filter((op) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ''
      );
      const operationYear = operationDate.getFullYear();
      const operationMonth = (operationDate.getMonth() + 1).toString();

      return (
        op.estado === OperationStatus.CERRADA &&
        (year === 'all' || operationYear === Number(year)) &&
        (month === 'all' || operationMonth === month)
      );
    })
    .reduce((acc, op) => acc + Number(op.valor_reserva), 0);

// Function to calculate average operation value
export const calculateAverageOperationValue = (
  operations: Operation[],
  year: number | string,
  month: string = 'all'
) => {
  // Filter operations by year, month and closed status, excluding rentals
  const filteredOperations = operations.filter((op) => {
    const operationDate = new Date(
      op.fecha_operacion || op.fecha_reserva || ''
    );
    const operationYear = operationDate.getFullYear();
    const operationMonth = (operationDate.getMonth() + 1).toString();

    // Only include non-rental operations (ventas y desarrollos)
    const isNonRental =
      op.tipo_operacion !== 'Alquiler Tradicional' &&
      op.tipo_operacion !== 'Alquiler Temporal' &&
      op.tipo_operacion !== 'Alquiler Comercial' &&
      (op.tipo_operacion === 'Venta' ||
        op.tipo_operacion === 'Desarrollo Inmobiliario');

    return (
      op.estado === OperationStatus.CERRADA &&
      (year === 'all' || operationYear === Number(year)) &&
      (month === 'all' || operationMonth === month) &&
      isNonRental
    );
  });

  if (filteredOperations.length === 0) {
    return 0;
  }

  // Calculate total value and return average
  const totalValue = filteredOperations.reduce(
    (acc, op) => acc + (op.valor_reserva || 0),
    0
  );

  return totalValue / filteredOperations.length;
};

// Helper function to calculate the difference in days between two dates
const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  return Math.round((endDate.getTime() - startDate.getTime()) / oneDay);
};

// Function to calculate average days to sell for an agent
export const calculateAverageDaysToSell = (
  operations: Operation[],
  year: number | string,
  month: string = 'all'
) => {
  // Filter operations with required dates and closed status, excluding certain operation types
  const filteredOperations = operations.filter((op) => {
    const operationDate = new Date(
      op.fecha_operacion || op.fecha_reserva || ''
    );
    const operationYear = operationDate.getFullYear();
    const operationMonth = (operationDate.getMonth() + 1).toString();

    // Only include operations with both capture and reservation dates
    const hasBothDates = op.fecha_captacion && op.fecha_reserva;

    // Exclude certain operation types as per original logic
    const isValidOperationType =
      op.tipo_operacion !== OperationType.ALQUILER_TRADICIONAL &&
      op.tipo_operacion !== OperationType.ALQUILER_TEMPORAL &&
      op.tipo_operacion !== OperationType.ALQUILER_COMERCIAL &&
      op.tipo_operacion !== OperationType.DESARROLLO_INMOBILIARIO;

    return (
      op.estado === OperationStatus.CERRADA &&
      (year === 'all' || operationYear === Number(year)) &&
      (month === 'all' || operationMonth === month) &&
      hasBothDates &&
      isValidOperationType
    );
  });

  if (filteredOperations.length === 0) {
    return 0;
  }

  // Calculate total days
  const totalDays = filteredOperations.reduce((sum, op) => {
    const captacionDate = op.fecha_captacion
      ? new Date(op.fecha_captacion)
      : null;
    const reservaDate = op.fecha_reserva ? new Date(op.fecha_reserva) : null;

    if (captacionDate && reservaDate) {
      return sum + calculateDaysBetween(captacionDate, reservaDate);
    }
    return sum;
  }, 0);

  // Return average days
  return totalDays / filteredOperations.length;
};
