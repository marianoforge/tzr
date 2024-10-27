import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { COLORS } from '@/lib/constants';
import SkeletonLoader from '../CommonComponents/SkeletonLoader';
import { useOperationsData } from '@/hooks/useOperationsData';
import { Operation } from '@/types';

const CuadroPrincipalChart = () => {
  const { operations, isLoading, operationsError } = useOperationsData();

  const closedOperations = useMemo(() => {
    return operations.filter((op: Operation) => op.estado === 'Cerrada');
  }, [operations]);

  const tiposOperaciones = useMemo(() => {
    if (closedOperations.length > 0) {
      const tiposCount = closedOperations.reduce(
        (acc: Record<string, number>, op: Operation) => {
          acc[op.tipo_operacion] = (acc[op.tipo_operacion] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return Object.entries(tiposCount).map(([name, value]) => ({
        name,
        value,
      }));
    }
    return [];
  }, [closedOperations]);

  if (isLoading) {
    return <SkeletonLoader height={550} count={1} />;
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || 'An unknown error occurred'}</p>
    );
  }

  return (
    <div className="bg-white p-3 rounded-xl shadow-md w-full h-[560px] overflow-y-auto">
      <h2 className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[22px] text-center font-semibold mt-4 xl:mb-6">
        Tipo de Operaciones
      </h2>
      {tiposOperaciones.length === 0 ? (
        <p className="text-center text-[20px] xl:text-[20px] 2xl:text-[22px] font-semibold">
          No existen operaciones
        </p>
      ) : (
        <div className="h-[420px] w-full align-middle">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={tiposOperaciones}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {tiposOperaciones.map((entry, index) => (
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
