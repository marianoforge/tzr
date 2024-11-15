/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';

import {
  months,
  openOperationsByMonth2024,
  closedOperationsByMonth2024,
} from '@/common/utils/currentYearOps';
import { useAuthStore } from '@/stores/authStore';
import { Operation } from '@/common/types';
import { formatNumber } from '@/common/utils/formatNumber';

const generateData = (closedOperations: any, openOperations: any) => {
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();

  return months.map((month, index) => {
    let ventas = null;
    let proyeccion = null;

    if (index <= currentMonthIndex) {
      ventas = closedOperations[month] || null;
    }

    if (index >= currentMonthIndex && index <= 11) {
      proyeccion = (closedOperations[month] || 0) + openOperations;
    }

    return { mes: month, ventas, proyeccion };
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const currentMonthIndex = new Date().getMonth();
    const labelMonthIndex = new Date(
      Date.parse(label + ` 1, ${new Date().getFullYear()}`)
    ).getMonth();

    const isFutureOrCurrentMonth = labelMonthIndex >= currentMonthIndex;
    const ventasOrProyeccion = isFutureOrCurrentMonth
      ? 'Proyeccion Honorarios Brutos'
      : 'Honorarios Brutos Acumulados';
    const value = payload[0]?.value ?? 'N/A';

    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: '10px',
        }}
      >
        <p className="label">{`Mes: ${label}`}</p>
        <p className="intro">{`${ventasOrProyeccion.charAt(0).toUpperCase() + ventasOrProyeccion.slice(1)}: $${formatNumber(value)}`}</p>
      </div>
    );
  }

  return null;
};

const VentasAcumuladas = () => {
  const { userID } = useAuthStore();
  const currentMonthIndex = new Date().getMonth();

  const { data: operations = [] } = useQuery({
    queryKey: ['operations', userID],
    enabled: !!userID,
  });

  const closedOperationsByMonth = closedOperationsByMonth2024(
    operations as Operation[]
  );
  const openOperationsByMonth = openOperationsByMonth2024(
    operations as Operation[]
  );

  const data = generateData(closedOperationsByMonth, openOperationsByMonth);

  console.log(data);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-[30px] lg:text-[24px] xl:text-[24px] 2xl:text-[22px] font-semibold text-center">
        Monto Acumulado de Honorarios Brutos y Proyección
      </h2>
      <h2 className="text-[30px] text-gray-400 lg:text-[12px] font-semibold text-center">
        Corresponde a las operaciones cerradas, que no sean alquileres y tengan
        ambas puntas.
      </h2>
      <div className="h-100 w-full">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Line
              type="monotone"
              dataKey="ventas"
              stroke="#8884d8"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: '#FFFFFF',
              }}
              activeDot={{ r: 6 }}
              name={`Honorarios Brutos Acumulados: $${formatNumber(
                closedOperationsByMonth[months[currentMonthIndex]] || 0
              )}`}
              label={({ x, y, stroke, value }) => (
                <text
                  x={x}
                  y={y}
                  dy={-10}
                  fill={stroke}
                  fontWeight="bold"
                  fontSize={14}
                  opacity={0.5}
                  textAnchor="middle"
                >
                  ${value}
                </text>
              )}
            />

            <Line
              type="monotone"
              dataKey="proyeccion"
              stroke="#04B574"
              dot={false}
              strokeWidth={4}
              strokeDasharray="4"
              name={`Proyección de Honorarios Brutos: $${formatNumber(
                data[data.length - 1].proyeccion
              )}`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VentasAcumuladas;
