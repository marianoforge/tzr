import { useCallback } from 'react';
import { CircleStackIcon } from '@heroicons/react/24/outline';

import { useOperationsData } from '@/common/hooks/useOperationsData';
import { formatNumber } from '@/common/utils/formatNumber';
import {
  calculateClosedOperations2024SummaryByGroup,
  calculatePercentage,
} from '@/common/utils/calculationsPrincipal';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { Operation } from '@/common/types';

const CuadroPrincipal = () => {
  const { operations, isLoading, operationsError, totalCantidad2024 } =
    useOperationsData();

  const calculatePercentageCallback = useCallback(
    (cantidad: number, total: number) => calculatePercentage(cantidad, total),
    []
  );
  const chartCalculations =
    calculateClosedOperations2024SummaryByGroup(operations);

  const { totalMontoHonorariosBroker, summaryArray } = chartCalculations;

  const calculatePercentageValue = (
    totalHonorariosBrutos: number,
    totalMontoHonorariosBroker: number
  ) => {
    return formatNumber(
      (totalHonorariosBrutos / totalMontoHonorariosBroker) * 100
    );
  };

  const currentYear = new Date().getFullYear();
  const currentYearOperations = operations.filter(
    (operation: Operation) =>
      new Date(
        operation.fecha_operacion || operation.fecha_reserva || ''
      ).getFullYear() === currentYear
  );

  if (isLoading) {
    return <SkeletonLoader height={550} count={1} />;
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || 'An unknown error occurred'}</p>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full hidden md:block h-[785px] overflow-y-auto">
      <div>
        <h2 className="text-2xl lg:text-[24px] font-bold mb-10 text-center">
          Cuadro Tipos de Operaciones - {currentYear}
        </h2>
        {currentYearOperations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px]">
            <p className="flex flex-col text-center text-[20px] xl:text-[16px] 2xl:text-[16px] font-semibold items-center justify-center">
              <CircleStackIcon className="h-10 w-10 mr-2" />
              No existen operaciones
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto text-center">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-lightBlue/10 border-b-2 text-center text-sm text-mediumBlue h-[90px]">
                  {[
                    'Tipo de Operacion',
                    'Cantidad de Operaciones',
                    'Porcentaje Sobre el Total',
                    '% Ganancias Brutas',
                  ].map((header) => (
                    <th key={header} className="py-3 px-4 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaryArray.map((calcs, index) => (
                  <tr
                    key={calcs.group}
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-mediumBlue/10'
                    } hover:bg-lightBlue/10 border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out text-center h-[90px]`}
                  >
                    <td className="py-3 px-4 text-start text-base w-1/5 pl-8">
                      {calcs.operationType}
                    </td>
                    <td className="py-3 px-4 text-base">
                      {calcs.cantidadOperaciones}
                    </td>
                    <td className="py-3 px-4 text-base">
                      {calculatePercentageCallback(
                        calcs.cantidadOperaciones,
                        totalCantidad2024
                      )}
                      %
                    </td>
                    <td className="py-3 px-4 text-base">
                      {calculatePercentageValue(
                        calcs.totalHonorariosBrutos,
                        totalMontoHonorariosBroker
                      )}
                      %
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-lightBlue/10 h-24 text-center">
                  <td className="py-3 px-4 text-start text-base">Total</td>
                  <td className="py-3 px-4 text-base">{totalCantidad2024}</td>
                  <td className="py-3 px-4 text-base"></td>
                  <td className="py-3 px-4 text-base"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuadroPrincipal;
