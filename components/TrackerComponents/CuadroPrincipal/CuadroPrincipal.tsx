import { formatNumber } from "@/utils/formatNumber";
import Loader from "@/components/TrackerComponents/Loader";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { Operation } from "@/types";

const CuadroPrincipal = () => {
  const { userID } = useAuthStore();

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID, // Solo hace la petición si hay un userID
  });

  const totals = operations.reduce(
    (
      acc: {
        punta_compradora: number;
        punta_vendedora: number;
        honorarios_asesor: number;
      },
      op: Operation
    ) => {
      acc.punta_compradora += Number(op.punta_compradora);
      acc.punta_vendedora += Number(op.punta_vendedora);
      acc.honorarios_asesor += Number(op.honorarios_asesor);
      return acc;
    },
    {
      punta_compradora: 0,
      punta_vendedora: 0,
      honorarios_asesor: 0,
    }
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full hidden md:block">
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center">
            Cuadro Tipos de Operaciones
          </h2>
          {operations.length === 0 ? (
            <p className="text-center text-gray-600">No existen operaciones</p>
          ) : (
            <div className="overflow-x-auto text-center">
              <table className="w-full text-left border-collapse">
                <thead className="hidden md:table-header-group">
                  <tr className="border-b-2 text-center">
                    <th className="py-2 px-4 text-start">Tipo de Operación</th>
                    <th className="py-2 px-4">Punta Compradora</th>
                    <th className="py-2 px-4">Punta Vendedora</th>
                    <th className="py-2 px-4">Facturación Neta</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((operacion: Operation) => (
                    <tr
                      key={operacion.id}
                      className="border-b md:table-row flex flex-col md:flex-row mb-4 text-center "
                    >
                      <td className="py-2 px-4 text-start before:content-['Tipo_de_Operación:'] md:before:content-none ">
                        {operacion.tipo_operacion}
                      </td>
                      <td className="py-2 px-4 before:content-['Punta_Compradora:'] md:before:content-none">
                        {operacion.punta_compradora ? "Si" : "No"}
                      </td>
                      <td className="py-2 px-4 before:content-['Punta_Vendedora:'] md:before:content-none">
                        {operacion.punta_vendedora ? "Si" : "No"}
                      </td>
                      <td className="py-2 px-4 before:content-['Facturación_Neta:'] md:before:content-none">
                        ${formatNumber(operacion.honorarios_asesor)}
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="font-bold hidden md:table-row text-center">
                    <td className="py-2 px-4 text-start">Total</td>
                    <td className="py-2 px-4">
                      {formatNumber(totals.punta_compradora)}
                    </td>
                    <td className="py-2 px-4">
                      {formatNumber(totals.punta_vendedora)}
                    </td>
                    <td className="py-2 px-4">
                      ${formatNumber(totals.honorarios_asesor)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CuadroPrincipal;
