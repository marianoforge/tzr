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
import { formatNumber } from '@/common/utils/formatNumber';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
import { calculateNetFees } from '@/common/utils/calculateNetFees';
import { useUserDataStore } from '@/stores/userDataStore';
import { Operation, UserData } from '@/common/types';
import { OperationStatus } from '@/common/enums';

const Bubbles = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || '');

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

  // Calculamos los totales basados en las operaciones filtradas
  const totals = calculateTotals(
    currentYearOperations(operations, currentYear)
  );

  // Filtrar operaciones del año 2025
  const operations2025 = operations.filter(
    (op: Operation) =>
      new Date(op.fecha_operacion || op.fecha_reserva || '').getFullYear() ===
        currentYear && op.estado === OperationStatus.CERRADA
  );

  // Calcular tarifas netas para cada operación del 2025
  operations2025.forEach((op: Operation) => {
    const netFees = calculateNetFees(op, userData as UserData);
    return netFees;
  });

  const operationsByMonth = operations2025.reduce(
    (acc: Record<number, Operation[]>, op: Operation) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ''
      );
      const month = operationDate.getMonth() + 1;
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(op);
      return acc;
    },
    {} as Record<number, Operation[]>
  );

  // Haz un reduce de las operaciones del 2025 y suma las tarifas netas
  const totalNetFees = operations2025.reduce(
    (total: number, op: Operation) =>
      total + calculateNetFees(op, userData as UserData),
    0
  );

  // Obtener el mes actual
  const currentMonth = new Date().getMonth() + 1;

  // Filtrar solo los meses vencidos (excluyendo el mes actual)
  const completedMonthsWithOperations = Object.keys(operationsByMonth)
    .map(Number)
    .filter((month) => month < currentMonth);

  const totalNetFeesPromedio =
    completedMonthsWithOperations.length > 0
      ? totalNetFees / completedMonthsWithOperations.length
      : 0;

  const operationsEnCurso = operations.filter(
    (op: Operation) => op.estado === OperationStatus.EN_CURSO
  );

  const totalNetFeesEnCurso = operationsEnCurso.reduce(
    (total: number, op: Operation) =>
      total + calculateNetFees(op, userData as UserData),
    0
  );

  const totalHonorarioBrokerEnCurso = calculateTotals(operationsEnCurso);

  const bubbleData = [
    {
      title: 'Honorarios Netos',
      figure: `${currencySymbol}${formatNumber(totalNetFees)}`,
      bgColor: 'bg-lightBlue',
      textColor: 'text-white',
      tooltip:
        'Este es el monto total de honorarios netos obtenidos de las operaciones cerradas.',
    },
    {
      title: 'Honorarios Brutos',
      figure: `${currencySymbol}${formatNumber(
        totals.honorarios_broker_cerradas ?? 0
      )}`,
      bgColor: 'bg-darkBlue',
      textColor: 'text-white',
      tooltip:
        'Este es el monto total de honorarios brutos obtenido de las operaciones cerradas.',
    },
    {
      title: 'Monto Ops. Cerradas',
      figure: `${currencySymbol}${formatNumber(totals.valor_reserva_cerradas ?? 0)}`,
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
      tooltip:
        'Promedio del valor de las operaciones efectuadas excluyendo alquileres.',
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
      figure: `${currencySymbol}${formatNumber(totalNetFeesPromedio)}`,
      bgColor: 'bg-lightBlue',
      textColor: 'text-white',
      tooltip: 'Promedio de Honorarios netos totales por mes (vencido).',
    },
    {
      title: 'Honorarios Netos en Curso',
      figure: `${currencySymbol}${formatNumber(totalNetFeesEnCurso)}`,
      bgColor: 'bg-darkBlue',
      textColor: 'text-white',
      tooltip: 'Honorarios Netos sobre las operaciones en curso.',
    },
    {
      title: 'Honorarios Brutos en Curso',
      figure: `${currencySymbol}${formatNumber(
        totalHonorarioBrokerEnCurso.honorarios_broker_abiertas ?? 0
      )}`,
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
            <Tooltip
              id={`tooltip-${index}`}
              place="top"
              style={{ zIndex: 50 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bubbles;
