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

import { months } from '@/common/utils/currentYearOps';
import { useAuthStore } from '@/stores/authStore';
import { Operation } from '@/common/types';
import { formatNumber } from '@/common/utils/formatNumber';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
import { OperationStatus } from '@/common/enums';
import { calculateTotalHonorariosBroker } from '@/common/utils/calculations';

const generateData = (operations: Operation[]) => {
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calcular honorarios totales para operaciones cerradas y en curso
  const totalHonorariosCerradas = parseFloat(
    calculateTotalHonorariosBroker(operations, OperationStatus.CERRADA).toFixed(
      2
    )
  );

  const totalHonorariosEnCurso = parseFloat(
    calculateTotalHonorariosBroker(
      operations,
      OperationStatus.EN_CURSO
    ).toFixed(2)
  );

  const totalProyeccion = parseFloat(
    (totalHonorariosCerradas + totalHonorariosEnCurso).toFixed(2)
  );

  // Agrupar operaciones por mes
  const operationsByMonth = operations.reduce(
    (acc: Record<number, Operation[]>, op: Operation) => {
      const opDate = new Date(op.fecha_operacion || op.fecha_reserva || '');
      if (opDate.getFullYear() === currentYear) {
        const month = opDate.getMonth();
        if (!acc[month]) acc[month] = [];
        acc[month].push(op);
      }
      return acc;
    },
    {}
  );

  // Distribuir los valores acumulados a lo largo de los meses
  let acumuladoCerradas = 0;

  return months.map((month, index) => {
    // Calcular honorarios para operaciones cerradas (meses pasados y actual)
    let ventas = null;
    if (index <= currentMonthIndex) {
      // Para meses pasados, usamos datos acumulados reales
      const monthOperations = operationsByMonth[index] || [];
      const monthHonorarios = parseFloat(
        calculateTotalHonorariosBroker(
          monthOperations,
          OperationStatus.CERRADA
        ).toFixed(2)
      );
      acumuladoCerradas += monthHonorarios;
      ventas = parseFloat(acumuladoCerradas.toFixed(2));
    }

    // Calcular proyección para meses futuros y actual
    let proyeccion = null;
    if (index >= currentMonthIndex) {
      // Para la proyección, usamos el valor total fijo para todos los meses futuros
      proyeccion = totalProyeccion;
    }

    return { mes: month, ventas, proyeccion };
  });
};

const CustomTooltip = ({
  active,
  payload,
  label,
  currencySymbol = '$',
}: any) => {
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
        <p className="intro">{`${ventasOrProyeccion.charAt(0).toUpperCase() + ventasOrProyeccion.slice(1)}: ${currencySymbol}${formatNumber(value)}`}</p>
      </div>
    );
  }

  return null;
};

const VentasAcumuladas = () => {
  const { userID } = useAuthStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || '');

  const { data: operations = [] } = useQuery({
    queryKey: ['operations', userID],
    enabled: !!userID,
  });

  const data = generateData(operations as Operation[]);

  // Calcular totales para mostrar en la leyenda
  const totalHonorariosCerradas = calculateTotalHonorariosBroker(
    operations as Operation[],
    OperationStatus.CERRADA
  );

  const totalProyeccion =
    totalHonorariosCerradas +
    calculateTotalHonorariosBroker(
      operations as Operation[],
      OperationStatus.EN_CURSO
    );

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
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} currencySymbol={currencySymbol} />
              )}
            />
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
              name={`Honorarios Brutos Acumulados: ${currencySymbol}${formatNumber(totalHonorariosCerradas)}`}
              label={({ x, y, stroke, value }) => {
                const formattedValue =
                  value !== null && value !== undefined
                    ? formatNumber(value)
                    : '0';

                return (
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
                    ${formattedValue}
                  </text>
                );
              }}
            />

            <Line
              type="monotone"
              dataKey="proyeccion"
              stroke="#04B574"
              dot={false}
              strokeWidth={4}
              strokeDasharray="4"
              name={`Proyección de Honorarios Brutos: ${currencySymbol}${formatNumber(totalProyeccion)}`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VentasAcumuladas;
