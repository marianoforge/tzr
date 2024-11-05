import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { fetchUserOperations } from '@/lib/api/operationsApi';
import { Operation } from '@/common/types/';
import {
  calculateOperationData,
  calculateTotalLastColumnSum,
} from '@/common/utils/calculationsPrincipal';
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

  const operationData = useMemo(
    () => calculateOperationData(closedOperations),
    [closedOperations]
  );

  const totalCantidad2024 = closedOperations.filter(
    (op: Operation) => new Date(op.fecha_operacion).getFullYear() === 2024
  ).length;

  return {
    operations,
    isLoading,
    operationsError,
    operationData,
    totalCantidad2024,
  };
};
