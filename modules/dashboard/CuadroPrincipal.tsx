import { useCallback } from 'react';
import { useOperationsData } from '@/common/hooks/useOperationsData';
import { formatNumber } from '@/common/utils/formatNumber';
import { calculatePercentage } from '@/common/utils/calculationsPrincipal';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { OperationType } from '@/common/enums';

const CuadroPrincipal = () => {
  const {
    operations,
    isLoading,
    operationsError,
    totals,
    operationData,
    adjustedTotalVentaSum,
    totalCantidad2024,
  } = useOperationsData();

  const typedOperationData = operationData as Record<
    string,
    { cantidad: number; totalHonorarios: number; totalVenta: number }
  >;

  const calculatePercentageCallback = useCallback(
    (cantidad: number, total: number) => calculatePercentage(cantidad, total),
    []
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
    <div className="bg-white p-4 rounded-xl shadow-md w-full hidden md:block h-[610px] overflow-y-auto">
      <div>
        <h2 className="text-2xl lg:text-[24px] font-bold mb-4 text-center">
          Cuadro Tipos de Operaciones - 2024
        </h2>
        {operations.length === 0 ? (
          <p className="text-center text-gray-600">No existen operaciones</p>
        ) : (
          <div className="overflow-x-auto text-center">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-lightBlue/10 border-b-2 text-center text-sm text-mediumBlue h-18">
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
                {Object.entries(typedOperationData).map(
                  ([tipo, data], index) => (
                    <tr
                      key={tipo}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-mediumBlue/10'
                      } hover:bg-lightBlue/10 border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out text-center h-12`}
                    >
                      <td className="py-3 px-4 text-start text-base w-1/5 pl-8">
                        {tipo}
                      </td>
                      <td className="py-3 px-4 text-base">{data.cantidad}</td>
                      <td className="py-3 px-4 text-base">
                        {calculatePercentageCallback(
                          data.cantidad,
                          totalCantidad2024
                        )}
                        %
                      </td>
                      <td className="py-3 px-4 text-base">TBD %</td>
                      <td className="py-3 px-4 text-base">
                        {[
                          OperationType.COCHERA,
                          OperationType.ALQUILER_TEMPORAL,
                          OperationType.ALQUILER_TRADICIONAL,
                          OperationType.ALQUILER_COMERCIAL,
                          OperationType.LOCALES_COMERCIALES,
                          OperationType.FONDO_DE_COMERCIO,
                          OperationType.LOTES_PARA_DESARROLLOS,
                        ].includes(tipo as OperationType)
                          ? ''
                          : `$${formatNumber(
                              (data.totalVenta ?? 0) / (data.cantidad || 1)
                            )}`}
                      </td>
                    </tr>
                  )
                )}
                <tr className="font-bold bg-lightBlue/10 h-16 text-center">
                  <td className="py-3 px-4 text-start text-base">Total</td>
                  <td className="py-3 px-4 text-base">{totalCantidad2024}</td>
                  <td className="py-3 px-4 text-base"></td>
                  <td className="py-3 px-4 text-base"></td>
                  <td className="py-3 px-4 text-base">
                    ${formatNumber(adjustedTotalVentaSum)}
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
