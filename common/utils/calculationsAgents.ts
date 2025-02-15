import { Operation } from '@/common/types';

import { OperationStatus } from '../enums';

// Function to calculate adjusted broker fees
export const calculateAdjustedBrokerFees = (
  operations: Operation[],
  year: number
) =>
  operations
    .filter(
      (op) =>
        op.estado === OperationStatus.CERRADA &&
        new Date(op.fecha_operacion || op.fecha_reserva || '').getFullYear() ===
          year
    )
    .reduce((acc: number, op: Operation) => {
      const isHalfOperation =
        op.user_uid &&
        op.user_uid_adicional &&
        op.user_uid !== op.user_uid_adicional;

      return acc + op.honorarios_broker * (isHalfOperation ? 0.5 : 1);
    }, 0);

// Function to calculate total operations
export const calculateTotalOperations = (
  operations: Operation[],
  year: number
) =>
  operations
    .filter(
      (op) =>
        op.estado === OperationStatus.CERRADA &&
        new Date(op.fecha_operacion || op.fecha_reserva || '').getFullYear() ===
          year
    )
    .reduce((total, op) => {
      const isHalfOperation =
        op.user_uid &&
        op.user_uid_adicional &&
        op.user_uid !== op.user_uid_adicional;
      const isSingleOperation = op.user_uid && !op.user_uid_adicional;
      return total + (isHalfOperation ? 0.5 : 0) + (isSingleOperation ? 1 : 0);
    }, 0);

// Function to calculate total buyer tips
export const calculateTotalBuyerTips = (
  operations: Operation[],
  year: number
) =>
  operations
    .filter(
      (op) =>
        op.estado === OperationStatus.CERRADA &&
        new Date(op.fecha_operacion || op.fecha_reserva || '').getFullYear() ===
          year
    )
    .reduce((acc, op) => acc + (op.punta_compradora ? 1 : 0), 0);

// Function to calculate total seller tips
export const calculateTotalSellerTips = (
  operations: Operation[],
  year: number
) =>
  operations
    .filter(
      (op) =>
        op.estado === OperationStatus.CERRADA &&
        new Date(op.fecha_operacion || op.fecha_reserva || '').getFullYear() ===
          year
    )
    .reduce((acc, op) => acc + (op.punta_vendedora ? 1 : 0), 0);

// Function to calculate total tips
export const calculateTotalTips = (operations: Operation[], year: number) =>
  operations
    .filter(
      (op) =>
        op.estado === OperationStatus.CERRADA &&
        new Date(op.fecha_operacion || op.fecha_reserva || '').getFullYear() ===
          year
    )
    .reduce(
      (acc, op) =>
        acc + (op.punta_compradora ? 1 : 0) + (op.punta_vendedora ? 1 : 0),
      0
    );

// Function to calculate total reservation value
export const calculateTotalReservationValue = (
  operations: Operation[],
  year: number
) =>
  operations
    .filter(
      (op) =>
        op.estado === OperationStatus.CERRADA &&
        new Date(op.fecha_operacion || op.fecha_reserva || '').getFullYear() ===
          year
    )
    .reduce((acc, op) => acc + Number(op.valor_reserva), 0);
