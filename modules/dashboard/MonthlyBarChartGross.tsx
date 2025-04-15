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
import { OperationStatus, UserRole } from '@/common/enums';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
import { calculateTotalHonorariosBroker } from '@/common/utils/calculations';
import { useUserDataStore, useCalculationsStore } from '@/stores';
import { months } from '@/common/utils/currentYearOps';

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
        <p className="intro">{`2024: ${currencySymbol}${formatNumber(payload[0].value)}`}</p>
        <p className="intro">{`2025: ${currencySymbol}${formatNumber(payload[1].value)}`}</p>
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
  const { userData } = useUserDataStore();
  const { setOperations, setUserData, setUserRole, calculateResults } =
    useCalculationsStore();
  const [data, setData] = useState<
    { name: string; currentYear: number; previousYear: number }[]
  >([]);
  const [totalPreviousYear, setTotalPreviousYear] = useState(0);
  const [totalCurrentYear, setTotalCurrentYear] = useState(0);
  const { currencySymbol } = useUserCurrencySymbol(userID || '');

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
    isSuccess: operationsLoaded,
  } = useQuery({
    queryKey: ['operations', userID],
    queryFn: async () => {
      const allOperations = await fetchUserOperations(userID || '');
      return allOperations.filter(
        (operation: Operation) => operation.estado === OperationStatus.CERRADA
      );
    },
    enabled: !!userID,
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false,
  });

  // Combinamos los efectos en uno solo para asegurar que la secuencia sea correcta
  useEffect(() => {
    const updateCalculations = async () => {
      if (operations.length > 0 && userData) {
        // Primero configuramos las operaciones
        setOperations(operations);

        // Luego configuramos los datos del usuario
        setUserData(userData);

        // Configuramos el rol del usuario
        if (userData.role) {
          setUserRole(userData.role as UserRole);
        }

        // Finalmente calculamos los resultados
        calculateResults();

        // Procesamos los datos para el gráfico
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

        // Initialize the array with months and zero values
        const dataByMonth = months.map((month) => ({
          name: month,
          currentYear: 0,
          previousYear: 0,
        }));

        let total2024 = 0;
        let total2025 = 0;

        // Calculate honorarios brutos by month for 2024
        operations2024.forEach((operation: Operation) => {
          const operationDate = new Date(
            operation.fecha_operacion || operation.fecha_reserva || ''
          );
          const monthIndex = operationDate.getMonth();

          // Calculate honorarios brutos for this operation
          const honorariosBrutos = calculateTotalHonorariosBroker([operation]);
          total2024 += honorariosBrutos;

          // Add to the previous year total for this month
          dataByMonth[monthIndex].previousYear += honorariosBrutos;
        });

        // Calculate honorarios brutos by month for 2025
        operations2025.forEach((operation: Operation) => {
          const operationDate = new Date(
            operation.fecha_operacion || operation.fecha_reserva || ''
          );
          const monthIndex = operationDate.getMonth();

          // Calculate honorarios brutos for this operation
          const honorariosBrutos = calculateTotalHonorariosBroker([operation]);
          total2025 += honorariosBrutos;

          // Add to the current year total for this month
          dataByMonth[monthIndex].currentYear += honorariosBrutos;
        });

        setTotalPreviousYear(parseFloat(total2024.toFixed(2)));
        setTotalCurrentYear(parseFloat(total2025.toFixed(2)));

        // Format values to 2 decimal places
        const formattedData = dataByMonth.map((item) => ({
          ...item,
          currentYear: parseFloat(item.currentYear.toFixed(2)),
          previousYear: parseFloat(item.previousYear.toFixed(2)),
        }));

        setData(formattedData);
      }
    };

    if (operationsLoaded) {
      updateCalculations();
    }
  }, [
    operations,
    userData,
    operationsLoaded,
    setOperations,
    setUserData,
    setUserRole,
    calculateResults,
    setData,
  ]);

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
        Honorarios Brutos Mensuales 2025
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={MAX_BAR_SIZE} barGap={5}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                if (value === '2024') {
                  return (
                    <span>
                      {value}{' '}
                      <span className="ml-1">
                        Honorarios Netos Acumulados: {currencySymbol}
                        {formatNumber(totalPreviousYear)}
                      </span>
                    </span>
                  );
                }
                if (value === '2025') {
                  return (
                    <span>
                      {value}{' '}
                      <span className="ml-1">
                        Honorarios Netos Acumulados: {currencySymbol}
                        {formatNumber(totalCurrentYear)}
                      </span>
                    </span>
                  );
                }
                return value;
              }}
            />
            <Bar
              dataKey="previousYear"
              fill={COLORS[1]}
              name="2024"
              maxBarSize={MAX_BAR_SIZE}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="currentYear"
              fill={COLORS[2]}
              name="2025"
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
