import { OperationStatus } from '../enums';
import { Operation } from '../types';

export function filteredOperations(
  operations: Operation[] | undefined,
  statusFilter: string,
  yearFilter: number,
  monthFilter: string
) {
  return operations?.filter((operation: Operation) => {
    // Usamos fecha de operación o, en su defecto, fecha de reserva.
    const rawDate = operation.fecha_operacion || operation.fecha_reserva;
    if (!rawDate) return false;

    // Agregamos "T00:00:00Z" para asegurar que se interprete la fecha como UTC.
    const operationDate = new Date(rawDate + 'T00:00:00Z');

    // Obtenemos el año de la operación en UTC.
    const operationYear = operationDate.getUTCFullYear();

    const statusMatch =
      statusFilter === OperationStatus.TODAS ||
      (statusFilter === OperationStatus.EN_CURSO &&
        operation.estado === OperationStatus.EN_CURSO) ||
      (statusFilter === OperationStatus.CERRADA &&
        operation.estado === OperationStatus.CERRADA);

    let dateMatch = false;
    if (monthFilter === 'all') {
      // Si no se filtra por mes, solo comprobamos el año.
      dateMatch = operationYear === yearFilter;
    } else {
      // Convertimos el filtro de mes (1-indexado) a número y calculamos el rango de fechas.
      const monthNumber = parseInt(monthFilter, 10);
      const startDate = new Date(Date.UTC(yearFilter, monthNumber - 1, 1));
      // El día 0 del mes siguiente corresponde al último día del mes seleccionado.
      const endDate = new Date(Date.UTC(yearFilter, monthNumber, 0));
      dateMatch = operationDate >= startDate && operationDate <= endDate;
    }

    return statusMatch && dateMatch;
  });
}
