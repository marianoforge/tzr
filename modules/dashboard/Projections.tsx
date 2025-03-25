/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
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
import { useAuthStore, useUserDataStore, useCalculationsStore } from '@/stores';
import { Operation } from '@/common/types';
import { formatNumber } from '@/common/utils/formatNumber';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
import { OperationStatus, UserRole } from '@/common/enums';
import { calculateTotalHonorariosBroker } from '@/common/utils/calculations';
import { fetchUserOperations } from '@/lib/api/operationsApi';

const generateData = (
  operations: Operation[],
  totalHonorariosCerradas: number,
  totalHonorariosEnCurso: number
) => {
  // Usar los valores del store en lugar de calcularlos directamente
  const totalProyeccion = parseFloat(
    (totalHonorariosCerradas + totalHonorariosEnCurso).toFixed(2)
  );

  // Filtrar operaciones solo del año 2025
  const operations2025 = operations.filter((op) => {
    const operationDate = new Date(
      op.fecha_operacion || op.fecha_reserva || ''
    );
    return operationDate.getFullYear() === 2025;
  });

  // Agrupar operaciones por mes
  const operationsByMonth = operations2025.reduce(
    (acc: Record<number, Operation[]>, op: Operation) => {
      const opDate = new Date(op.fecha_operacion || op.fecha_reserva || '');
      const month = opDate.getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(op);
      return acc;
    },
    {}
  );

  // Distribuir los valores acumulados a lo largo de los meses
  let acumuladoCerradas = 0;

  // Obtener el mes actual (solo para mostrar proyección en meses actuales y futuros)
  const currentMonthIndex = new Date().getMonth();

  return months.map((month, index) => {
    // Calcular honorarios para operaciones cerradas (todos los meses hasta el actual)
    let ventas = null;
    if (index <= currentMonthIndex) {
      // Para meses pasados, usamos datos acumulados reales
      const monthOperations = operationsByMonth[index] || [];
      const monthHonorarios = parseFloat(
        calculateTotalHonorariosBroker(
          monthOperations.filter((op) => op.estado === OperationStatus.CERRADA)
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
      Date.parse(label + ` 1, ${2025}`)
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
  const { userData } = useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || '');
  const { results, setOperations, setUserData, setUserRole, calculateResults } =
    useCalculationsStore();

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
    isSuccess: operationsLoaded,
  } = useQuery({
    queryKey: ['operations', userID],
    queryFn: () => fetchUserOperations(userID || ''),
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
  ]);

  // Obtener valores del store para los cálculos
  const totalHonorariosCerradas = results.honorariosBrutos;
  const totalHonorariosEnCurso = results.honorariosBrutosEnCurso;
  const totalProyeccion = totalHonorariosCerradas + totalHonorariosEnCurso;

  // Generar los datos usando los valores del store
  const data = generateData(
    operations as Operation[],
    totalHonorariosCerradas,
    totalHonorariosEnCurso
  );

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-full">
        <p className="text-center">Cargando datos...</p>
      </div>
    );
  }

  if (operationsError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-full">
        <p className="text-center text-red-500">
          Error: No se pudieron cargar los datos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-[30px] lg:text-[24px] xl:text-[24px] 2xl:text-[22px] font-semibold text-center">
        Honorarios Brutos y Proyección 2025
      </h2>
      <h2 className="text-[30px] text-gray-400 lg:text-[12px] font-semibold text-center">
        Honorarios brutos de operaciones cerradas + proyección de operaciones en
        curso.
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
              name={`Proyección Total de Honorarios: ${currencySymbol}${formatNumber(totalProyeccion)}`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VentasAcumuladas;
