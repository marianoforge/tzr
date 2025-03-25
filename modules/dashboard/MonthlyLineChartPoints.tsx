import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';

import { formatNumber } from '@/common/utils/formatNumber';
import { fetchUserOperations } from '@/lib/api/operationsApi';
import { calculateTotals } from '@/common/utils/calculations';
import { Operation } from '@/common/types/';
import { useAuthStore } from '@/stores/authStore';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { MonthNames, OperationStatus } from '@/common/enums';

// Datos proporcionados
const monthNames = [
  MonthNames.ENERO,
  MonthNames.FEBRERO,
  MonthNames.MARZO,
  MonthNames.ABRIL,
  MonthNames.MAYO,
  MonthNames.JUNIO,
  MonthNames.JULIO,
  MonthNames.AGOSTO,
  MonthNames.SEPTIEMBRE,
  MonthNames.OCTUBRE,
  MonthNames.NOVIEMBRE,
  MonthNames.DICIEMBRE,
];

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-md">
        <p className="label font-semibold">{`${label}`}</p>
        <p className="intro">{`${new Date().getFullYear()}: ${formatNumber(payload[0]?.value)}%`}</p>
        <p className="intro">{`${new Date().getFullYear() - 1}: ${formatNumber(payload[1]?.value)}%`}</p>
        <p className="intro">{`Diferencia Interanual: ${formatNumber(
          (payload[0]?.value || 0) - (payload[1]?.value || 0)
        )}%`}</p>
      </div>
    );
  }

  return null;
};

const MonthlyLineChartPoints = () => {
  const { userID } = useAuthStore();
  const [chartData, setChartData] = useState<
    { name: string; value2023: number; value2024: number }[]
  >([]);
  const [average2024, setAverage2024] = useState<number>(0);
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
      const totals = calculateTotals(operations);
      const formattedData2024 =
        totals.porcentaje_honorarios_broker_por_mes_currentYear
          ? Object.entries(
              totals.porcentaje_honorarios_broker_por_mes_currentYear
            ).map(([month, value]) => ({
              name: monthNames[parseInt(month, 10) - 1],
              value2024: value,
            }))
          : [];

      const formattedData2023 =
        totals.porcentaje_honorarios_broker_por_mes_pastYear
          ? Object.entries(
              totals.porcentaje_honorarios_broker_por_mes_pastYear
            ).map(([month, value]) => ({
              name: monthNames[parseInt(month, 10) - 1],
              value2023: value,
            }))
          : [];

      const mergedData = monthNames.map((month) => {
        const data2023 = formattedData2023.find(
          (data) => data.name === month
        ) || { value2023: 0 };
        const data2024 = formattedData2024.find(
          (data) => data.name === month
        ) || { value2024: 0 };

        return {
          name: month,
          value2023: data2023.value2023,
          value2024: data2024.value2024,
        };
      });

      setChartData(mergedData);

      const total2024 = mergedData.reduce(
        (sum, data) => sum + data.value2024,
        0
      );

      // Contar solo los meses que tienen operaciones (value2024 > 0)
      const monthsWithOperations = mergedData.filter(
        (data) => data.value2024 > 0
      ).length;

      // Calcular el promedio usando solo los meses con operaciones
      // Si no hay meses con operaciones, el promedio será 0
      const average2024 =
        monthsWithOperations > 0 ? total2024 / monthsWithOperations : 0;
      setAverage2024(average2024);
    }
  }, [operations]);

  if (isLoading) {
    return <SkeletonLoader height={380} count={1} />;
  }

  if (operationsError) {
    return (
      <p>Error: {operationsError.message || 'An unknown error occurred'}</p>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow-md w-full">
        <p className="text-center text-gray-600">No existen operaciones</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-[30px] lg:text-[24px] xl:text-[24px] 2xl:text-[22px] font-semibold text-center">
        Porcentaje de Honorarios Brutos por Mes
      </h2>
      <h2 className="text-[30px] text-gray-400 lg:text-[12px] font-semibold text-center">
        Corresponde a las operaciones cerradas, que no sean alquileres y tengan
        ambas puntas.
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value2024"
              stroke="#00b4d8"
              strokeWidth={3}
              name={new Date().getFullYear().toString()}
            >
              <LabelList
                dataKey="value2024"
                position="top"
                offset={20}
                className="font-bold"
                formatter={(value: number) => `${value}%`}
              />
            </Line>
            <Line
              type="monotone"
              dataKey="value2023"
              stroke="#0077b6"
              strokeWidth={3}
              name={(new Date().getFullYear() - 1).toString()}
            >
              <LabelList
                dataKey="value2023"
                position="bottom"
                offset={20}
                className="font-bold"
                formatter={(value: number) => `${value}%`}
              />
            </Line>
            <Line
              name={`Promedio Acumulado ${new Date().getFullYear()} : ${formatNumber(average2024)}%`}
              stroke="#3f37c9"
            ></Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyLineChartPoints;
