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
import { formatOperationsData } from '@/utils/formatOperationsData';
import { Operation } from '@/types';

import SkeletonLoader from '../SkeletonLoader';
import { formatNumber } from '@/utils/formatNumber';

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded-xl shadow-md">
        <p className="label font-semibold">{`Mes: ${label}`}</p>
        <p className="intro">{`Año Anterior: $${formatNumber(payload[0].value)}`}</p>
        <p className="intro">{`Año Actual: $${formatNumber(payload[1].value)}`}</p>
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
    { month: string; currentYear: number; previousYear: number }[]
  >([]);

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
  } = useQuery({
    queryKey: ['operations', userID],
    queryFn: async () => {
      const allOperations = await fetchUserOperations(userID || '');
      return allOperations.filter(
        (operation: Operation) => operation.estado === 'Cerrada'
      );
    },
    enabled: !!userID, // Solo ejecuta la query si hay un userID
  });

  // Efecto para formatear los datos obtenidos
  useEffect(() => {
    if (operations.length > 0) {
      const closedOperations = operations.filter(
        (operation: Operation) => operation.estado === 'Cerrada'
      );
      const formattedData = formatOperationsData(
        closedOperations,
        'honorarios_broker'
      );

      // Verificar que los datos estén correctamente formateados
      const validData = formattedData.map((item) => ({
        ...item,
        currentYear: isNaN(item.currentYear) ? 0 : item.currentYear,
        previousYear: isNaN(item.previousYear) ? 0 : item.previousYear,
      }));
      setData(validData);
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
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="previousYear"
              fill={COLORS[1]}
              name="Año Anterior"
              maxBarSize={MAX_BAR_SIZE}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="currentYear"
              fill={COLORS[2]}
              name="Año Actual"
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
