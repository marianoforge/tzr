import { Operation } from "@/types";

// Function to calculate adjusted broker fees
export const calculateAdjustedBrokerFees = (operations: Operation[]) =>
  operations.reduce((acc: number, op: Operation) => {
    const isHalfOperation =
      op.user_uid &&
      op.user_uid_adicional &&
      op.user_uid !== op.user_uid_adicional;
    return acc + op.honorarios_broker * (isHalfOperation ? 0.5 : 1);
  }, 0);

// Function to calculate total operations
export const calculateTotalOperations = (operations: Operation[]) =>
  operations.reduce((total, op) => {
    const isHalfOperation =
      op.user_uid &&
      op.user_uid_adicional &&
      op.user_uid !== op.user_uid_adicional;
    const isSingleOperation = op.user_uid && !op.user_uid_adicional;
    return total + (isHalfOperation ? 0.5 : 0) + (isSingleOperation ? 1 : 0);
  }, 0);

// Function to calculate total buyer tips
export const calculateTotalBuyerTips = (operations: Operation[]) =>
  operations.reduce((acc, op) => acc + (op.punta_compradora ? 1 : 0), 0);

// Function to calculate total seller tips
export const calculateTotalSellerTips = (operations: Operation[]) =>
  operations.reduce((acc, op) => acc + (op.punta_vendedora ? 1 : 0), 0);

// Function to calculate total tips
export const calculateTotalTips = (operations: Operation[]) =>
  operations.reduce(
    (acc, op) =>
      acc + (op.punta_compradora ? 1 : 0) + (op.punta_vendedora ? 1 : 0),
    0
  );

// Function to calculate total reservation value
export const calculateTotalReservationValue = (operations: Operation[]) =>
  operations.reduce((acc, op) => acc + op.valor_reserva, 0);
