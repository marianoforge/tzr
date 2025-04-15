import { Operation } from '@/common/types';
import { calculateTotalHonorariosBroker } from '@/common/utils/calculations';

import { OperationStatus } from '../enums';

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
