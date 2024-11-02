import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { fetchUserOperations } from '@/lib/api/operationsApi';
import { Operation } from '@/common/types/';
import {
  calculateOperationData,
  calculateTotalCantidad,
  calculateTotalLastColumnSum,
} from '@/common/utils/calculationsPrincipal';
import { calculateTotals } from '@/common/utils/calculations';
import { OperationStatus } from '../enums';

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
    (op: Operation) => op.estado === OperationStatus.CERRADA
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
