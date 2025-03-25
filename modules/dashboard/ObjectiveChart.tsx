import React, { PureComponent } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import router from 'next/router';
import { Tooltip } from 'react-tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

import { useUserDataStore } from '@/stores/userDataStore';
import { OBJECTIVE_CHART_COLORS } from '@/lib/constants';
import { Operation, UserData } from '@/common/types/';
import { calculateTotals } from '@/common/utils/calculations';
import { fetchUserOperations } from '@/common/utils/operationsApi';
import { useAuthStore } from '@/stores/authStore';
import { formatNumber } from '@/common/utils/formatNumber';
import { currentYearOperations } from '@/common/utils/currentYearOps';
import 'react-tooltip/dist/react-tooltip.css';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
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
    const { userData } = useUserDataStore();
    const { userID } = useAuthStore();
    const { currencySymbol } = useUserCurrencySymbol(userID || '');

    const {
      data: operations = [],
      isLoading,
      error: operationsError,
    } = useQuery({
      queryKey: ['operations', userID],
      queryFn: () => fetchUserOperations(userID || ''),
      enabled: !!userID,
    });

    // Verificar explícitamente si está cargando
    if (isLoading === true) {
      // Intenta un enfoque diferente para el esqueleto
      return (
        <div className="relative   w-full" style={{ height: '225px' }}>
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
        userData={userData!}
        operations={operations}
        currencySymbol={currencySymbol}
      />
    );
  };
}

// Define the props type
interface ObjectiveChartProps {
  userData: UserData;
  operations: Operation[];
  currencySymbol: string;
}

class ObjectiveChart extends PureComponent<ObjectiveChartProps> {
  render() {
    const { userData, operations, currencySymbol } = this.props;
    const currentYear = new Date().getFullYear();
    // Calcular los totales usando las operaciones filtradas
    const totals = calculateTotals(
      currentYearOperations(operations, currentYear)
    );

    const percentage =
      ((totals.honorarios_broker_cerradas ?? 0) /
        (userData?.objetivoAnual ?? 1)) *
      100;

    return (
      <div
        className="relative bg-white rounded-lg p-2 text-center shadow-md flex flex-col items-center w-full"
        style={{ height: '225px' }}
      >
        <p className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[18px] font-semibold pt-2 pb-2">
          Objetivo Anual de Ventas
        </p>
        <div
          className="absolute top-2 right-2  cursor-pointer"
          data-tooltip-id="objective-tooltip"
          data-tooltip-content="Porcentaje de los honorarios totales brutos menos los gastos de Team / Broker"
        >
          <InformationCircleIcon className="text-mediumBlue stroke-2 h-6 w-6 lg:h-5 lg:w-5" />
        </div>
        <Tooltip id="objective-tooltip" place="top" />
        {!userData?.objetivoAnual ? (
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
              {`Objetivo Anual de Ventas: ${currencySymbol}${formatNumber(
                totals.honorarios_broker_cerradas ?? 0
              )} / ${currencySymbol}${formatNumber(userData?.objetivoAnual ?? 0)}`}
            </h3>
          </>
        )}
      </div>
    );
  }
}

export default withUserData(ObjectiveChart);
