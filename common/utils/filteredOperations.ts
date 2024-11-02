import { Operation } from '@/common/types';

export function filteredOperations(
  operations: Operation[] | undefined,
  statusFilter: string,
  yearFilter: string,
  monthFilter: string
) {
  const currentYear = new Date().getFullYear();
  return operations?.filter((operation: Operation) => {
    const operationDate = new Date(operation.fecha_operacion);
    const operationYear = operationDate.getFullYear();
    const operationMonth = operationDate.getMonth() + 1; // getMonth() returns 0-based month
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'open' && operation.estado === 'En Curso') ||
      (statusFilter === 'closed' && operation.estado === 'Cerrada');

    const yearMatch =
      (yearFilter === '2023' && operationYear === 2023) ||
      (yearFilter === '2024' && operationYear === 2024);

    const monthMatch =
      monthFilter === 'all' || operationMonth === parseInt(monthFilter, 10);

    return statusMatch && yearMatch && monthMatch;
  });
}
