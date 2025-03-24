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
import { Operation, UserData } from '@/common/types/';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { formatNumber } from '@/common/utils/formatNumber';
import { OperationStatus } from '@/common/enums';
import { calculateNetFees } from '@/common/utils/calculateNetFees';
import { useUserDataStore } from '@/stores/userDataStore';
import { months } from '@/common/utils/currentYearOps';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';

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

const MonthlyBarChart: React.FC = () => {
  const { userID } = useAuthStore();
  const [data, setData] = useState<
    { month: string; currentYear: number; previousYear: number }[]
  >([]);
  const { userData } = useUserDataStore();

  // Utilizamos useQuery para obtener las operaciones del usuario
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
    enabled: !!userID, // Solo ejecuta la query si hay un userID
  });

  // Efecto para formatear los datos obtenidos
  useEffect(() => {
    if (operations.length > 0) {
      const operations2024 = operations.filter(
        (operation: Operation) =>
          new Date(
            operation.fecha_operacion || operation.fecha_reserva || ''
          ).getFullYear() === 2024 &&
          operation.estado === OperationStatus.CERRADA
      );

      const operations2025 = operations.filter(
        (operation: Operation) =>
          new Date(
            operation.fecha_operacion || operation.fecha_reserva || ''
          ).getFullYear() === 2025 &&
          operation.estado === OperationStatus.CERRADA
      );

      // Inicializamos el array con los meses y valores en 0
      const data2024_2025 = months.map((month) => ({
        month,
        currentYear: 0,
        previousYear: 0,
      }));

      operations2024.forEach((operation: Operation) => {
        const operationDate = new Date(
          operation.fecha_operacion || operation.fecha_reserva || ''
        );
        const monthIndex = operationDate.getMonth();
        const netFees = calculateNetFees(operation, userData as UserData);

        // Sumamos las tarifas netas del año 2024
        data2024_2025[monthIndex].previousYear += netFees;
      });

      operations2025.forEach((operation: Operation) => {
        const operationDate = new Date(
          operation.fecha_operacion || operation.fecha_reserva || ''
        );
        const monthIndex = operationDate.getMonth();
        const netFees = calculateNetFees(operation, userData as UserData);

        // Sumamos las tarifas netas del año 2025
        data2024_2025[monthIndex].currentYear += netFees;
      });

      // Formateamos los valores finales a 2 decimales también
      const validData2024_2025 = data2024_2025.map((item) => ({
        ...item,
        currentYear: parseFloat(item.currentYear.toFixed(2)),
        previousYear: parseFloat(item.previousYear.toFixed(2)),
      }));

      setData(validData2024_2025);
    }
  }, [operations, userData]);

  if (data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Honorarios Brutos Mensuales
        </h2>
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
        Honorarios Netos Mensuales
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
              name={(new Date().getFullYear() - 1).toString()}
              maxBarSize={MAX_BAR_SIZE}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="currentYear"
              fill={COLORS[0]}
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

export default MonthlyBarChart;
