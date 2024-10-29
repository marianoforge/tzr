import { Operation } from '@/common/types';

export function filteredOperations(
  operations: Operation[] | undefined,
  statusFilter: string,
  yearFilter: string,
  monthFilter: string
) {
  const currentYear = new Date().getFullYear();
  return operations?.filter((operation: Operation) => {
    const operationYear = new Date(operation.fecha_operacion).getFullYear();
    const operationMonth = new Date(operation.fecha_operacion).getMonth() + 1;

    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'open' && operation.estado === 'En Curso') ||
      (statusFilter === 'closed' && operation.estado === 'Cerrada');

    const yearMatch =
      yearFilter === 'all' ||
      (yearFilter === 'currentYear' && operationYear === currentYear) ||
      (yearFilter === 'year2023' && operationYear === 2023);

    const monthMatch =
      monthFilter === 'all' || operationMonth === parseInt(monthFilter);

    return statusMatch && yearMatch && monthMatch;
  });
}
