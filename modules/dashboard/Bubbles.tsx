import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tooltip } from 'react-tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

import { fetchUserOperations } from '@/lib/api/operationsApi';
import { calculateTotals } from '@/common/utils/calculations';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuthStore } from '@/stores/authStore';
import { formatValue } from '@/common/utils/formatValue';
import { currentYearOperations } from '@/common/utils/currentYearOps';

const Bubbles = () => {
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

  // Calculamos los totales basados en las operaciones filtradas
  const totals = calculateTotals(currentYearOperations(operations));

  const bubbleData = [
    {
      title: 'Honorarios Netos',
      figure: formatValue(totals.honorarios_asesor_cerradas ?? 0, 'currency'),
      bgColor: 'bg-lightBlue',
      textColor: 'text-white',
      tooltip:
        'Este es el monto total de honorarios netos obtenidos de las operaciones cerradas.',
    },
    {
      title: 'Honorarios Brutos',
      figure: formatValue(totals.honorarios_broker_cerradas ?? 0, 'currency'),
      bgColor: 'bg-darkBlue',
      textColor: 'text-white',
      tooltip:
        'Este es el monto total de honorarios brutos obtenido de las operaciones cerradas.',
    },
    {
      title: 'Monto Sobre Operaciones Cerradas',
      figure: formatValue(totals.valor_reserva_cerradas ?? 0, 'currency'),
      bgColor: 'bg-lightBlue',
      textColor: 'text-white',
      tooltip: 'Este es el valor total de las operaciones cerradas.',
    },
    {
      title: 'Cantidad Total de Puntas',
      figure: formatValue(totals.suma_total_de_puntas, 'none'),
      bgColor: 'bg-darkBlue',
      textColor: 'text-white',
      tooltip: 'Número total de puntas realizadas.',
    },
    {
      title: 'Promedio Valor Operación',
      figure: formatValue(
        totals.total_valor_ventas_desarrollos ?? 0,
        'currency'
      ),
      bgColor: 'bg-lightBlue',
      textColor: 'text-white',
      tooltip: 'Promedio del valor de las operaciones efectuadas.',
    },
    {
      title: 'Cantidad de Operaciones Cerradas',
      figure: formatValue(totals.cantidad_operaciones, 'none'),
      bgColor: 'bg-darkBlue',
      textColor: 'text-white',
      tooltip: 'Número total de operaciones efectuadas cerradas.',
    },
    {
      title: 'Promedio Mensual Honorarios Netos',
      figure: formatValue(
        totals.promedio_mensual_honorarios_asesor ?? 0,
        'currency'
      ),
      bgColor: 'bg-lightBlue',
      textColor: 'text-white',
      tooltip: 'Promedio de Honorarios netos totales por mes.',
    },
    {
      title: 'Honorarios Netos en Curso',
      figure: formatValue(totals.honorarios_asesor_abiertas ?? 0, 'currency'),
      bgColor: 'bg-darkBlue',
      textColor: 'text-white',
      tooltip: 'Honorarios Netos sobre las operaciones en curso.',
    },
    {
      title: 'Honorarios Brutos en Curso',
      figure: formatValue(totals.honorarios_broker_abiertas ?? 0, 'currency'),
      bgColor: 'bg-lightBlue',
      textColor: 'text-white',
      tooltip: 'Honorarios Brutos sobre las operaciones en curso.',
    },
  ];

  if (isLoading) {
    return <SkeletonLoader height={220} count={2} />;
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || 'An unknown error occurred'}</p>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md min-h-[465px] flex justify-center items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 w-[100%]">
        {bubbleData.map((data, index) => (
          <div
            key={index}
            className={`${data.bgColor} rounded-xl py-6 text-center shadow-md flex flex-col justify-around items-center h-[120px] relative gap-4`}
          >
            {/* Heroicons Info icon with tooltip */}
            <InformationCircleIcon
              className="absolute top-1 right-1 text-white stroke-2 h-6 w-6 lg:h-4 lg:w-4 cursor-pointer z-10"
              data-tooltip-id={`tooltip-${index}`}
              data-tooltip-content={data.tooltip}
            />

            <p className="text-lg text-white sm:text-md lg:text-[16px] xl:text-sm 2xl:text-[15px] lg:px-1 font-semibold h-1/2 items-center justify-center flex px-3 2xl:px-2">
              {data.title}
            </p>
            <p
              className={`text-[40px] sm:text-[28px] lg:text-[18px] xl:text-md 2xl:text-[20px] font-bold ${data.textColor} h-1/2 items-center justify-center flex`}
            >
              {data.figure}
            </p>

            {/* Tooltip for the icon */}
            <Tooltip id={`tooltip-${index}`} place="top" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bubbles;
