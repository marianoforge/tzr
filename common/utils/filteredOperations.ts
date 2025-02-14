import { OperationStatus } from '../enums';
import { Operation } from '../types';

export function filteredOperations(
  operations: Operation[] | undefined,
  statusFilter: string,
  yearFilter: number,
  monthFilter: string
) {
  return operations?.filter((operation: Operation) => {
    const operationDate = operation.fecha_operacion
      ? new Date(operation.fecha_operacion)
      : operation.fecha_reserva
        ? new Date(operation.fecha_reserva)
        : null;

    if (!operationDate) return false;

    const operationYear = operationDate.getFullYear();
    const operationMonth = operationDate.getMonth() + 1; // getMonth() returns 0-based month
    const statusMatch =
      statusFilter === OperationStatus.TODAS ||
      (statusFilter === OperationStatus.EN_CURSO &&
        operation.estado === OperationStatus.EN_CURSO) ||
      (statusFilter === OperationStatus.CERRADA &&
        operation.estado === OperationStatus.CERRADA);

    const yearMatch = yearFilter === operationYear;

    const monthMatch =
      monthFilter === 'all' || operationMonth === parseInt(monthFilter, 10);

    return statusMatch && yearMatch && monthMatch;
  });
}
