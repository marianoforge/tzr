import React from 'react';
import { useQuery } from '@tanstack/react-query';

import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { fetchUserOperations } from '@/common/utils/operationsApi';
import { useAuthStore } from '@/stores/authStore';
import { currentYearOperations } from '@/common/utils/currentYearOps';
import { calculateTotals } from '@/common/utils/calculations';

const DaysToSell: React.FC = () => {
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

  const currentYear = new Date().getFullYear();

  const totals = calculateTotals(
    currentYearOperations(operations, currentYear)
  );

  if (isLoading) {
    return <SkeletonLoader height={440} count={1} />;
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || 'An unknown error occurred'}</p>
    );
  }

  const promedioDiasVenta = totals.promedio_dias_venta?.toFixed(2);

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md items-center justify-center max-h-[180px] h-[180px]">
      <h1 className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[22px] font-semibold flex justify-center items-center h-2/5 pt-6">
        Tiempo Promedio de Venta{' '}
      </h1>
      <p className="text-[48px] lg:text-[40px] font-bold text-greenAccent h-3/5 items-center justify-center flex">
        {promedioDiasVenta !== '0.00' ? (
          promedioDiasVenta + ' días'
        ) : (
          <span className="text-base font-semibold">
            No existen operaciones cerradas
          </span>
        )}
      </p>
    </div>
  );
};

export default DaysToSell;
