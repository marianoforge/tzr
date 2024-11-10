import { Operation } from '@/common/types';

export const filterOperationsBySearch = (
  operations: Operation[],
  searchQuery: string
): Operation[] => {
  if (!searchQuery) return operations;

  const lowercasedQuery = searchQuery.toLowerCase();

  return operations.filter(
    (operation) =>
      operation.direccion_reserva.toLowerCase().includes(lowercasedQuery) ||
      (operation.realizador_venta &&
        operation.realizador_venta.toLowerCase().includes(lowercasedQuery)) ||
      (operation.numero_casa &&
        operation.numero_casa.toLowerCase().includes(lowercasedQuery))
  );
};

export const filterAgentsBySearch = <T>(
  items: T[],
  searchQuery: string,
  keys: (keyof T)[]
): T[] => {
  if (!searchQuery) return items;

  const lowercasedQuery = searchQuery.toLowerCase();

  return items.filter((item) =>
    keys.some((key) =>
      String(item[key]).toLowerCase().includes(lowercasedQuery)
    )
  );
};
