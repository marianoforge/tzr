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
