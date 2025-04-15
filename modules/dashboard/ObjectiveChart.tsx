import React, { PureComponent } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import router from 'next/router';
import { Tooltip } from 'react-tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

import { useUserDataStore } from '@/stores/userDataStore';
import { OBJECTIVE_CHART_COLORS } from '@/lib/constants';
import { Operation, UserData } from '@/common/types/';
import { fetchUserOperations } from '@/common/utils/operationsApi';
import { useAuthStore } from '@/stores/authStore';
import { formatNumber } from '@/common/utils/formatNumber';
import 'react-tooltip/dist/react-tooltip.css';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
import { useCalculationsStore } from '@/stores';
import { UserRole } from '@/common/enums';

const RADIAN = Math.PI / 180;

const needle = (
  value: number,
  data: { name: string; value: number; color: string }[],
  cx: number,
  cy: number,
  iR: number,
  oR: number,
  color: string | undefined
) => {
  const total = 100; // Assume total is 100 for percentage calculation
  const ang = 180.0 * (1 - value / total); // Calculate angle based on percentage
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <circle key="circle" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
    <path
      key="path"
      d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
      stroke="#none"
      fill={color}
    />,
  ];
};

function withUserData(Component: React.ComponentType<ObjectiveChartProps>) {
  return function WrappedComponent(props: React.JSX.IntrinsicAttributes) {
    const {
      userData,
      isLoading: isUserDataLoading,
      fetchUserData,
    } = useUserDataStore();
    const { userID } = useAuthStore();
    const { currencySymbol } = useUserCurrencySymbol(userID || '');
    const {
      results,
      setOperations,
      setUserData,
      setUserRole,
      calculateResults,
    } = useCalculationsStore();

    // Consulta React Query para obtener datos del usuario directamente del API
    const { data: userDataFromQuery, isLoading: isUserQueryLoading } = useQuery(
      {
        queryKey: ['userData', userID],
        queryFn: async () => {
          if (!userID) return null;
          const token = await useAuthStore.getState().getAuthToken();
          if (!token) throw new Error('User not authenticated');

          const response = await axios.get(`/api/users/${userID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return response.data;
        },
        enabled: !!userID,
        refetchOnWindowFocus: true,
        staleTime: 0, // Siempre obtenemos datos frescos
      }
    );

    // Usar el userData más actualizado (de la consulta o del store)
    // Priorizar los datos de la consulta React Query ya que son más recientes
    const mergedUserData = userDataFromQuery || userData;

    // Cargar datos del usuario si no están disponibles
    React.useEffect(() => {
      if (userID && !userData && !isUserDataLoading) {
        fetchUserData(userID);
      }

      // Si tenemos datos de la consulta, actualizar el store
      if (userDataFromQuery && !isUserQueryLoading) {
        setUserData(userDataFromQuery);
        if (userDataFromQuery.role) {
          setUserRole(userDataFromQuery.role as UserRole);
        }
      }
    }, [
      userID,
      userData,
      userDataFromQuery,
      isUserDataLoading,
      isUserQueryLoading,
      fetchUserData,
      setUserData,
      setUserRole,
    ]);

    const {
      data: operations = [],
      isLoading: isOperationsLoading,
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
    React.useEffect(() => {
      const updateCalculations = async () => {
        if (operations.length > 0 && mergedUserData) {
          // Primero configuramos las operaciones
          setOperations(operations);

          // Luego configuramos los datos del usuario
          setUserData(mergedUserData);

          // Configuramos el rol del usuario
          if (mergedUserData.role) {
            setUserRole(mergedUserData.role as UserRole);
          }

          // Finalmente calculamos los resultados
          calculateResults();
        }
      };

      if (operationsLoaded && mergedUserData) {
        updateCalculations();
      }
    }, [
      operations,
      mergedUserData,
      operationsLoaded,
      setOperations,
      setUserData,
      setUserRole,
      calculateResults,
    ]);

    // Verificar si está cargando datos
    const isLoading =
      isOperationsLoading ||
      isUserDataLoading ||
      isUserQueryLoading ||
      !mergedUserData;

    // Mostrar esqueleto mientras carga
    if (isLoading) {
      return (
        <div className="relative w-full" style={{ height: '225px' }}>
          <SkeletonLoader height={225} count={1} />
        </div>
      );
    }

    // Manejo de error
    if (operationsError) {
      return (
        <div
          className="relative bg-white rounded-lg p-2 text-center shadow-md w-full"
          style={{ height: '225px' }}
        >
          <p className="text-red-500 pt-10">
            Error: {operationsError?.message || 'An unknown error occurred'}
          </p>
        </div>
      );
    }

    return (
      <Component
        {...props}
        userData={mergedUserData}
        operations={operations}
        currencySymbol={currencySymbol}
        honorariosBrutos2025={results.honorariosBrutos}
      />
    );
  };
}

// Define the props type
interface ObjectiveChartProps {
  userData: UserData;
  operations: Operation[];
  currencySymbol: string;
  honorariosBrutos2025?: number;
}

class ObjectiveChart extends PureComponent<ObjectiveChartProps> {
  render() {
    const { userData, currencySymbol, honorariosBrutos2025 } = this.props;

    // Validar que userData exista
    if (!userData) {
      return (
        <div
          className="relative bg-white rounded-lg p-2 text-center shadow-md flex flex-col items-center w-full"
          style={{ height: '225px' }}
        >
          <p className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[18px] font-semibold pt-2 pb-2">
            Objetivo Anual de Ventas 2025
          </p>
          <div className="flex justify-center items-center h-[150px]">
            <p>Cargando datos del usuario...</p>
          </div>
        </div>
      );
    }

    // Use honorariosBrutos2025 from calculationsStore
    const honorariosValue = honorariosBrutos2025 ?? 0;

    // Asegurarse de que objetivoAnual siempre sea un número
    const objetivoAnual =
      typeof userData?.objetivoAnual === 'number' ? userData.objetivoAnual : 0;

    // Calcular porcentaje solo si objetivoAnual > 0 para evitar división por cero
    const percentage =
      objetivoAnual > 0 ? (honorariosValue / objetivoAnual) * 100 : 0;

    return (
      <div
        className="relative bg-white rounded-lg p-2 text-center shadow-md flex flex-col items-center w-full"
        style={{ height: '225px' }}
      >
        <p className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[18px] font-semibold pt-2 pb-2">
          Objetivo Anual de Ventas 2025
        </p>
        <div
          className="absolute top-2 right-2  cursor-pointer"
          data-tooltip-id="objective-tooltip"
          data-tooltip-content="Porcentaje de los honorarios totales brutos menos los gastos de Team / Broker"
        >
          <InformationCircleIcon className="text-mediumBlue stroke-2 h-6 w-6 lg:h-5 lg:w-5" />
        </div>
        <Tooltip id="objective-tooltip" place="top" />
        {!objetivoAnual ? (
          <div className="flex justify-center items-center">
            <button
              className="bg-mediumBlue text-white p-2 rounded-md font-semibold mt-2"
              onClick={() => {
                router.push('/settings');
              }}
            >
              Agrega tu objetivo anual de ventas
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center items-center h-[225px]">
              <PieChart width={240} height={110}>
                <Pie
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  data={OBJECTIVE_CHART_COLORS}
                  cx={120}
                  cy={85}
                  innerRadius={55}
                  outerRadius={75}
                  fill="#8884d8"
                  stroke="none"
                  paddingAngle={1}
                >
                  {OBJECTIVE_CHART_COLORS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {needle(
                  percentage,
                  OBJECTIVE_CHART_COLORS,
                  120,
                  85,
                  55,
                  75,
                  '#00b4d8'
                )}
              </PieChart>
            </div>
            <h3 className="font-semibold text-mediumBlue text-base">
              {`Objetivo Anual 2025: ${currencySymbol}${
                formatNumber(honorariosValue) || '0'
              } / ${currencySymbol}${formatNumber(objetivoAnual) || '0'}`}
            </h3>
          </>
        )}
      </div>
    );
  }
}

export default withUserData(ObjectiveChart);
