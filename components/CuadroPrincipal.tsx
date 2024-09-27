// components/CuadroPrincipal.tsx
import { useEffect } from "react";
import { formatNumber } from "../utils/formatNumber";
import Loader from "./Loader";
import { useOperationsStore } from "@/stores/useOperationsStore";
import { useAuthStore } from "@/stores/useAuthStore";

const CuadroPrincipal: React.FC = () => {
  const { userID } = useAuthStore();
  const { operations, totals, isLoading, fetchOperations } =
    useOperationsStore();

  useEffect(() => {
    if (userID) {
      fetchOperations(userID);
    }
  }, [userID, fetchOperations]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-4 rounded shadow-md w-full hidden md:block">
      <h2 className="text-2xl font-bold mb-4 text-center">Cuadro Principal</h2>
      {operations.length === 0 ? (
        <p className="text-center text-gray-600">No existen operaciones</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="hidden md:table-header-group">
              <tr className="border-b-2">
                <th className="py-2 px-4">Tipo de Operación</th>
                <th className="py-2 px-4">Punta Compradora</th>
                <th className="py-2 px-4">Punta Vendedora</th>
                <th className="py-2 px-4">Facturación Neta</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((operacion) => (
                <tr
                  key={operacion.id}
                  className="border-b md:table-row flex flex-col md:flex-row mb-4 text-center"
                >
                  <td className="py-2 px-4 before:content-['Tipo_de_Operación:'] md:before:content-none">
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
                <td className="py-2 px-4">Total</td>
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
  );
};

export default CuadroPrincipal;
