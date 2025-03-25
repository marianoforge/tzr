import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';
import { fetchUserOperations } from '@/lib/api/operationsApi';
import { COLORS, MAX_BAR_SIZE } from '@/lib/constants';
import { Operation } from '@/common/types/';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { formatNumber } from '@/common/utils/formatNumber';
import { OperationStatus } from '@/common/enums';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
import { calculateTotalHonorariosBroker } from '@/common/utils/calculations';

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}> = ({ active, payload, label }) => {
  const { userID } = useAuthStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || '');

  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded-xl shadow-md">
        <p className="label font-semibold">{`Mes: ${label}`}</p>
        <p className="intro">{`${new Date().getFullYear() - 1}: ${currencySymbol}${formatNumber(payload[0].value)}`}</p>
        <p className="intro">{`${new Date().getFullYear()}: ${currencySymbol}${formatNumber(payload[1].value)}`}</p>
        <p className="intro">{`Diferencia Interanual: $${formatNumber(
          payload[1].value - payload[0].value
        )}`}</p>
      </div>
    );
  }

  return null;
};

const MonthlyBarChartGross: React.FC = () => {
  const { userID } = useAuthStore();
  const [data, setData] = useState<
    { name: string; currentYear: number; previousYear: number }[]
  >([]);

  // Function to get month name from index
  const getMonthName = (index: number): string => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months[index];
  };

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
  } = useQuery({
    queryKey: ['operations', userID],
    queryFn: async () => {
      const allOperations = await fetchUserOperations(userID || '');
      return allOperations.filter(
        (operation: Operation) => operation.estado === OperationStatus.CERRADA
      );
    },
    enabled: !!userID,
  });

  useEffect(() => {
    if (operations.length > 0) {
      const closedOperations = operations.filter(
        (operation: Operation) => operation.estado === OperationStatus.CERRADA
      );

      const calculateHonorariosByMonth = (
        operations: Operation[],
        year: number
      ) => {
        const operationsByMonth = Array(12)
          .fill(0)
          .map((_, index) => {
            const monthOperations = operations.filter((op) => {
              const date = new Date(
                op.fecha_operacion || op.fecha_reserva || ''
              );
              return date.getFullYear() === year && date.getMonth() === index;
            });

            return calculateTotalHonorariosBroker(
              monthOperations,
              OperationStatus.CERRADA
            );
          });

        return operationsByMonth;
      };

      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;

      const currentYearData = calculateHonorariosByMonth(
        closedOperations,
        currentYear
      );
      const previousYearData = calculateHonorariosByMonth(
        closedOperations,
        previousYear
      );

      const formattedData = Array(12)
        .fill(0)
        .map((_, index) => ({
          name: getMonthName(index),
          currentYear: currentYearData[index] || 0,
          previousYear: previousYearData[index] || 0,
        }));

      setData(formattedData);
    }
  }, [operations]);

  if (data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow-md w-full">
        <p className="text-center text-gray-600">No existen operaciones</p>
      </div>
    );
  }

  if (isLoading) {
    return <SkeletonLoader height={380} count={1} />;
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || 'An unknown error occurred'}</p>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-[30px] lg:text-[24px] xl:text-[24px] 2xl:text-[22px] font-semibold mb-6 text-center">
        Honorarios Brutos Mensuales
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={MAX_BAR_SIZE} barGap={5}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="previousYear"
              fill={COLORS[1]}
              name={(new Date().getFullYear() - 1).toString()}
              maxBarSize={MAX_BAR_SIZE}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="currentYear"
              fill={COLORS[2]}
              name={new Date().getFullYear().toString()}
              maxBarSize={MAX_BAR_SIZE}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChartGross;
