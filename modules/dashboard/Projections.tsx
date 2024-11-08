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

import {
  months,
  openOperationsByMonth2024,
} from '@/common/utils/currentYearOps';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { Operation } from '@/common/types';
import { closedOperationsByMonth2024 } from '@/common/utils/currentYearOps';
import { formatNumber } from '@/common/utils/formatNumber';

const generateData = (closedOperations: any, openOperations: any) => {
  const currentMonthIndex = new Date().getMonth();

  return months.map((month, index) => {
    let ventas = null;
    let proyeccion = null;

    if (index < currentMonthIndex) {
      ventas = closedOperations[month] || null;
    } else if (index >= currentMonthIndex) {
      proyeccion = (closedOperations.Octubre || 0) + openOperations;
    }

    return { mes: month, ventas, proyeccion };
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const currentMonthIndex = new Date().getMonth();
    const labelMonthIndex = new Date(Date.parse(label + ' 1, 2024')).getMonth();

    const isFutureOrCurrentMonth = labelMonthIndex >= currentMonthIndex;
    const ventasOrProyeccion = isFutureOrCurrentMonth ? 'proyeccion' : 'ventas';
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

            {/* Línea para ventas reales con color condicional */}
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
              name="Ventas Acumuladas"
            />

            {/* Línea punteada para proyección */}
            <Line
              type="monotone"
              dataKey="proyeccion"
              stroke="#04B574"
              dot={false}
              strokeWidth={3}
              strokeDasharray="4"
              name={`Proyección: $${formatNumber(
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
