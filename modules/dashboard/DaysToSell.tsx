import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';

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

  const promedioDiasVenta = Number(totals.promedio_dias_venta?.toFixed(2));

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md items-center justify-center max-h-[180px] h-[180px] relative">
      <h1 className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[22px] font-semibold flex justify-center items-center h-2/5 pt-6 ">
        Tiempo Promedio de Venta{' '}
      </h1>
      <div
        className="absolute top-2 right-2 cursor-pointer"
        data-tooltip-id="daystosell-tooltip"
        data-tooltip-content="El tiempo medio de venta se toma comparando la fecha de captación/publicación vs. la fecha de reserva"
      >
        <InformationCircleIcon className="text-mediumBlue stroke-2 h-6 w-6 lg:h-5 lg:w-5" />
      </div>
      <Tooltip id="daystosell-tooltip" place="top" />
      <p className="text-[48px] lg:text-[40px] font-bold text-greenAccent h-3/5 items-center justify-center flex">
        {promedioDiasVenta !== undefined ? (
          promedioDiasVenta < 0 ? (
            <span className="text-base font-semibold">
              Revisar las fechas de las operaciones
            </span>
          ) : (
            promedioDiasVenta + ' días'
          )
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
