import { formatNumber } from '@/common/utils/formatNumber';
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

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active: boolean;
  payload: any;
  label: boolean;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-md">
        <p className="label font-semibold">{`${label}`}</p>
        <p className="intro">{`2023: ${payload[1].value}%`}</p>
        <p className="intro">{`2024: ${payload[0].value}%`}</p>
        <p className="intro">{`Diferencia Interanual: ${formatNumber(
          payload[0].value - payload[1].value
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
      const formattedData2024 = totals.porcentaje_honorarios_broker_por_mes_2024
        ? Object.entries(totals.porcentaje_honorarios_broker_por_mes_2024).map(
            ([month, value]) => ({
              name: monthNames[parseInt(month, 10) - 1],
              value2024: value,
            })
          )
        : [];

      const formattedData2023 = totals.porcentaje_honorarios_broker_por_mes_2023
        ? Object.entries(totals.porcentaje_honorarios_broker_por_mes_2023).map(
            ([month, value]) => ({
              name: monthNames[parseInt(month, 10) - 1],
              value2023: value,
            })
          )
        : [];

      const mergedData = monthNames.map((month, index) => {
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

      // Calculate the sum of all 2024 percentages
      const total2024 = mergedData.reduce(
        (sum, data) => sum + data.value2024,
        0
      );
      const currentMonth = new Date().getMonth(); // 0-based index, so January is 0
      const completedMonths = currentMonth; // Exclude the current month
      const average2024 = total2024 / completedMonths;
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
            <Tooltip content={<CustomTooltip active payload label />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value2024"
              stroke="#00b4d8"
              strokeWidth={3}
              name="2024"
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
              name="2023"
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
              name={`Promedio Acumulado 2024 : ${formatNumber(average2024)}%`}
              stroke="#3f37c9"
            ></Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyLineChartPoints;
