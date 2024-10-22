import { Operation } from "@/types";

const currentYear = new Date().getFullYear();

export const currentYearOperations = (operations: Operation[]) =>
  operations.filter((operation: Operation) => {
    const operationYear = new Date(operation.fecha_operacion).getFullYear();
    return operationYear === currentYear;
  });
