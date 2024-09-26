// components/CuadroPrincipal.tsx
import { useEffect, useState } from "react";
import { formatNumber } from "../utils/formatNumber";
import Loader from "./Loader";
import { useOperationsStore } from "@/stores/operationsStore";
import { Operacion } from "@/types";

interface CuadroPrincipalProps {
  userId: string;
}

const CuadroPrincipal = ({ userId }: CuadroPrincipalProps) => {
  const { isLoading } = useOperationsStore();
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [totals, setTotals] = useState({
    facturacion_bruta: 0,
    facturacion_neta: 0,
    punta_compradora: 0,
    punta_vendedora: 0,
  });

  // Fetch the operations data from your API using the userID
  useEffect(() => {
    const fetchOperaciones = async () => {
      if (!userId) return; // Ensure userID is available before making the request

      try {
        const response = await fetch(
          `/api/operationsPerUser?user_uid=${userId}`
        );
        if (!response.ok) {
          throw new Error("Error fetching operations");
        }

        const data = await response.json();
        setOperaciones(data);
        calculateTotals(data);
      } catch (error) {
        console.error("Error fetching operations:", error);
      }
    };

    fetchOperaciones();
  }, [userId]);

  const calculateTotals = (operations: Operacion[]) => {
    const totalFacturacionBruta = operations.reduce(
      (acc, op) => acc + op.honorarios_broker,
      0
    );
    const totalFacturacionNeta = operations.reduce(
      (acc, op) => acc + op.honorarios_asesor,
      0
    );
    const totalPuntaCompradora = operations.filter(
      (op) => op.punta_compradora
    ).length;
    const totalPuntaVendedora = operations.filter(
      (op) => op.punta_vendedora
    ).length;
    setTotals({
      facturacion_bruta: totalFacturacionBruta,
      facturacion_neta: totalFacturacionNeta,
      punta_compradora: totalPuntaCompradora,
      punta_vendedora: totalPuntaVendedora,
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-4 rounded shadow-md w-full hidden md:block">
      <h2 className="text-2xl font-bold mb-4 text-center">Cuadro Principal</h2>
      {operaciones.length === 0 ? (
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
              {operaciones.map((operacion) => (
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
                  ${formatNumber(totals.facturacion_neta)}
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
