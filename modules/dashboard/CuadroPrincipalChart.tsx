import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { CircleStackIcon } from '@heroicons/react/24/outline';

import { COLORS } from '@/lib/constants';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { useOperationsData } from '@/common/hooks/useOperationsData';
import { Operation } from '@/common/types';
import { tiposOperacionesPieChartData } from '@/common/utils/calculationsPrincipal';
import useResponsiveOuterRadius from '@/common/hooks/useResponsiveOuterRadius';

const CuadroPrincipalChart = () => {
  const { operations, isLoading, operationsError } = useOperationsData();

  const closedOperations = useMemo(() => {
    return operations.filter((op: Operation) => op.estado === 'Cerrada');
  }, [operations]);

  const rawData = tiposOperacionesPieChartData(closedOperations);
  const pieChartData = rawData.filter((item) => item.value > 0);

  const outerRadius = useResponsiveOuterRadius();

  if (isLoading) {
    return <SkeletonLoader height={550} count={1} />;
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || 'An unknown error occurred'}</p>
    );
  }

  return (
    <div className="bg-white p-3 rounded-xl shadow-md w-full h-[380px]">
      <h2 className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[24px] text-center font-semibold mt-2 xl:mb-3">
        Tipo de Operaciones
      </h2>
      {pieChartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[240px]">
          <p className="flex flex-col text-center text-[20px] xl:text-[16px] 2xl:text-[16px] font-semibold items-center justify-center">
            <CircleStackIcon className="h-10 w-10 mr-2" />
            No existen operaciones
          </p>
        </div>
      ) : (
        <div className="h-[300px] w-full align-middle px-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={outerRadius}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieChartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth={3}
                    strokeOpacity={0.7}
                    strokeLinecap="round"
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CuadroPrincipalChart;
