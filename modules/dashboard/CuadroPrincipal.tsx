import { useCallback } from 'react';
import { useOperationsData } from '@/common/hooks/useOperationsData';
import { formatNumber } from '@/common/utils/formatNumber';
import {
  calculateClosedOperations2024SummaryByGroup,
  calculatePercentage,
} from '@/common/utils/calculationsPrincipal';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { OperationType } from '@/common/enums';

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

  const nonRentalOperations = summaryArray.filter(
    (calcs) =>
      ![
        OperationType.ALQUILER_TEMPORAL,
        OperationType.ALQUILER_TRADICIONAL,
        OperationType.ALQUILER_COMERCIAL,
      ].includes(calcs.group as OperationType)
  );

  const averageMontoOperaciones =
    nonRentalOperations.reduce(
      (acc, calcs) =>
        acc + (calcs.totalMontoOperaciones || 0) / calcs.cantidadOperaciones,
      0
    ) / nonRentalOperations.length;

  const calculatePercentageValue = (
    totalHonorariosBrutos: number,
    totalMontoHonorariosBroker: number
  ) => {
    return formatNumber(
      (totalHonorariosBrutos / totalMontoHonorariosBroker) * 100
    );
  };

  const formatOperationAmount = (calcs: any) => {
    return [
      OperationType.ALQUILER_TEMPORAL,
      OperationType.ALQUILER_TRADICIONAL,
      OperationType.ALQUILER_COMERCIAL,
    ].includes(calcs.group as OperationType)
      ? ''
      : `$${formatNumber((calcs.totalMontoOperaciones ?? 0) / (calcs.cantidadOperaciones || 1))}`;
  };

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
          Cuadro Tipos de Operaciones - 2024
        </h2>
        {operations.length === 0 ? (
          <p className="text-center text-gray-600">No existen operaciones</p>
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
                    'Promedio Monto Ventas & Desarrollos',
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
                      {calcs.group}
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
                    <td className="py-3 px-4 text-base">
                      {formatOperationAmount(calcs)}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-lightBlue/10 h-24 text-center">
                  <td className="py-3 px-4 text-start text-base">Total</td>
                  <td className="py-3 px-4 text-base">{totalCantidad2024}</td>
                  <td className="py-3 px-4 text-base"></td>
                  <td className="py-3 px-4 text-base"></td>
                  <td className="py-3 px-4 text-base">
                    ${formatNumber(averageMontoOperaciones)}
                  </td>
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
