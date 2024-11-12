import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { OperationStatus } from '../enums';

import { useAuthStore } from '@/stores/authStore';
import { fetchUserOperations } from '@/lib/api/operationsApi';
import { Operation } from '@/common/types/';
import { calculateOperationData } from '@/common/utils/calculationsPrincipal';

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
    (op: Operation) =>
      new Date(op.fecha_operacion).getFullYear() === new Date().getFullYear()
  ).length;

  return {
    operations,
    isLoading,
    operationsError,
    operationData,
    totalCantidad2024,
  };
};
