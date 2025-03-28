import { CircleStackIcon } from '@heroicons/react/24/outline';

import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { formatNumber } from '@/common/utils/formatNumber';
import { useCarteraActiva } from '@/common/hooks/useCarteraActiva';
import { useAuthStore } from '@/stores/authStore';

interface CarteraActivaItem {
  direccion: string;
  valorOperacion: number;
  porcentajeVenta: number;
  valorActivo: number;
}

const CarteraActiva = () => {
  const { userID } = useAuthStore();
  const {
    exclusiveActiveOperations: carteraActivaData,
    isLoading,
    operationsError,
    totalValorOperacion,
    totalPorcentajeVenta,
    totalValorActivo,
  } = useCarteraActiva(userID || null);

  if (isLoading) {
    return <SkeletonLoader height={550} count={1} />;
  }

  if (operationsError) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md w-full">
        <p className="text-red-600 text-center">
          Error:{' '}
          {operationsError.message || 'Ocurrió un error al cargar los datos'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full hidden md:block h-auto min-h-[785px] flex flex-col">
      <div className="sticky top-0 bg-white pt-4 pb-6 z-10">
        <h2 className="text-2xl lg:text-[24px] font-bold mb-4 text-center">
          Activo Contingente
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto">
        {carteraActivaData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px]">
            <p className="flex flex-col text-center text-[20px] xl:text-[16px] 2xl:text-[16px] font-semibold items-center justify-center">
              <CircleStackIcon className="h-10 w-10 mr-2" />
              No existen operaciones activas
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto text-center">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-lightBlue/10 border-b-2 text-center text-sm text-mediumBlue h-[90px]">
                  {[
                    'Dirección de la Operación',
                    'Valor de La Operación',
                    'Porcentaje De Venta',
                    'Valor Activo',
                  ].map((header) => (
                    <th key={header} className="py-3 px-4 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {carteraActivaData.map(
                  (item: CarteraActivaItem, index: number) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-mediumBlue/10'
                      } hover:bg-lightBlue/10 border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out text-center h-[90px]`}
                    >
                      <td className="py-3 px-4 text-start text-base w-1/5 pl-8">
                        {item.direccion}
                      </td>
                      <td className="py-3 px-4 text-base">
                        ${formatNumber(item.valorOperacion)}
                      </td>
                      <td className="py-3 px-4 text-base">
                        {item.porcentajeVenta}%
                      </td>
                      <td className="py-3 px-4 text-base">
                        ${formatNumber(item.valorActivo)}
                      </td>
                    </tr>
                  )
                )}
                <tr className="font-bold bg-lightBlue/10 h-24 text-center">
                  <td className="py-3 px-4 text-start text-base">Total</td>
                  <td className="py-3 px-4 text-base">
                    ${formatNumber(totalValorOperacion)}
                  </td>
                  <td className="py-3 px-4 text-base">
                    {totalPorcentajeVenta}%
                  </td>
                  <td className="py-3 px-4 text-base">
                    ${formatNumber(totalValorActivo)}
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

export default CarteraActiva;
