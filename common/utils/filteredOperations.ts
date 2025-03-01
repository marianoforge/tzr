import { OperationStatus } from '../enums';
import { Operation } from '../types';

export function filteredOperations(
  operations: Operation[] | undefined,
  statusFilter: string,
  yearFilter: string, // Ahora es string para manejar "all"
  monthFilter: string
) {
  return operations?.filter((operation: Operation) => {
    // Usamos fecha de operación o, en su defecto, fecha de reserva/captación.
    const rawDate =
      operation.fecha_operacion ||
      operation.fecha_reserva ||
      operation.fecha_captacion;
    if (!rawDate) return false;

    // Interpretamos la fecha en UTC para evitar problemas de zona horaria.
    const operationDate = new Date(rawDate + 'T00:00:00Z');
    const operationYear = operationDate.getUTCFullYear();
    const operationMonth = operationDate.getUTCMonth() + 1; // Convertido a 1-indexado

    const statusMatch =
      statusFilter === OperationStatus.TODAS ||
      (statusFilter === OperationStatus.EN_CURSO &&
        operation.estado === OperationStatus.EN_CURSO) ||
      (statusFilter === OperationStatus.CERRADA &&
        operation.estado === OperationStatus.CERRADA) ||
      (statusFilter === OperationStatus.CAIDA &&
        operation.estado === OperationStatus.CAIDA);

    let dateMatch = false;

    if (yearFilter === 'all' && monthFilter === 'all') {
      // Incluir solo operaciones cuyo año sea 2024 o superior.
      dateMatch = operationYear >= 2024;
    } else if (yearFilter === 'all' && monthFilter !== 'all') {
      const monthNumber = parseInt(monthFilter, 10);
      // Operación en un año >=2024 y con el mes indicado.
      dateMatch = operationYear >= 2024 && operationMonth === monthNumber;
    } else if (yearFilter !== 'all' && monthFilter === 'all') {
      // Filtrar solo por el año especificado.
      dateMatch = operationYear === Number(yearFilter);
    } else {
      // Filtrar por un año y mes específicos (rango exacto).
      const monthNumber = parseInt(monthFilter, 10);
      const yearNumber = Number(yearFilter);
      const startDate = new Date(Date.UTC(yearNumber, monthNumber - 1, 1));
      const endDate = new Date(Date.UTC(yearNumber, monthNumber, 0));
      dateMatch = operationDate >= startDate && operationDate <= endDate;
    }

    return statusMatch && dateMatch;
  });
}
