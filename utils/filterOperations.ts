import { Operation } from '@/types';

export const filterOperationsBySearch = (
  operations: Operation[],
  searchQuery: string
): Operation[] => {
  if (!searchQuery) return operations;

  const lowercasedQuery = searchQuery.toLowerCase();

  return operations.filter((operation) =>
    operation.direccion_reserva.toLowerCase().includes(lowercasedQuery)
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
