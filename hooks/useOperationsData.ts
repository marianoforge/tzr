import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { fetchUserOperations } from '@/lib/api/operationsApi';
import { Operation } from '@/types';
import {
  calculateOperationData,
  calculateTotalCantidad,
  calculateTotalLastColumnSum,
} from '@/utils/calculationsPrincipal';
import { calculateTotals } from '@/utils/calculations';

export const useOperationsData = () => {
  const { userID } = useAuthStore();

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
  } = useQuery({
    queryKey: ['operations', userID],
    queryFn: () => fetchUserOperations(userID || ''),
    enabled: !!userID,
  });

  const closedOperations = operations.filter(
    (op: Operation) => op.estado === 'Cerrada'
  );

  const totals = calculateTotals(closedOperations);

  const operationData = useMemo(
    () => calculateOperationData(closedOperations),
    [closedOperations]
  );

  const totalCantidad = useMemo(
    () => calculateTotalCantidad(operationData),
    [operationData]
  );

  const totalLastColumnSum = useMemo(
    () => calculateTotalLastColumnSum(operationData),
    [operationData]
  );

  const adjustedTotalVentaSum = useMemo(
    () => totalLastColumnSum / 2,
    [totalLastColumnSum]
  );

  return {
    operations,
    isLoading,
    operationsError,
    totals,
    operationData,
    totalCantidad,
    adjustedTotalVentaSum,
  };
};
