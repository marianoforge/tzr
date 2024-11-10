import { OperationStatus, YearFilter } from '../enums';
import { Operation } from '../types';

export function filteredOperations(
  operations: Operation[] | undefined,
  statusFilter: string,
  yearFilter: string,
  monthFilter: string
) {
  return operations?.filter((operation: Operation) => {
    const operationDate = new Date(operation.fecha_operacion);
    const operationYear = operationDate.getFullYear();
    const operationMonth = operationDate.getMonth() + 1; // getMonth() returns 0-based month
    const statusMatch =
      statusFilter === OperationStatus.TODAS ||
      (statusFilter === OperationStatus.EN_CURSO &&
        operation.estado === OperationStatus.EN_CURSO) ||
      (statusFilter === OperationStatus.CERRADA &&
        operation.estado === OperationStatus.CERRADA);

    const yearMatch =
      (yearFilter === YearFilter.DOS_MIL_VEINTITRES &&
        operationYear === 2023) ||
      (yearFilter === YearFilter.DOS_MIL_VEINTICUATRO &&
        operationYear === 2024);

    const monthMatch =
      monthFilter === 'all' || operationMonth === parseInt(monthFilter, 10);

    return statusMatch && yearMatch && monthMatch;
  });
}
