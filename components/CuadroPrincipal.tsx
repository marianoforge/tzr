// components/CuadroPrincipal.tsx
import { useEffect, useState } from "react";

interface Operacion {
  valor_reserva: number;
  honorarios_brutos: number;
  valor_neto: number;
}

const CuadroPrincipal = () => {
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [numeroOperaciones, setNumeroOperaciones] = useState(0);
  const [puntas, setPuntas] = useState(0);
  const [facturacionBruto, setFacturacionBruto] = useState(0);
  const [facturacionNeta, setFacturacionNeta] = useState(0);

  // Fetch the operations data from your API
  useEffect(() => {
    const fetchOperaciones = async () => {
      try {
        const response = await fetch("/api/operaciones"); // Assumes you have an endpoint that returns the operations
        if (!response.ok) {
          throw new Error("Error al obtener las operaciones");
        }
        const data = await response.json();
        setOperaciones(data);
      } catch (error) {
        console.error("Error fetching operations:", error);
      }
    };

    fetchOperaciones();
  }, []);

  // Calculate the values to display in the columns
  useEffect(() => {
    setNumeroOperaciones(operaciones.length);

    // Assuming each operation counts as a single point
    setPuntas(operaciones.length);

    // Calculate the total gross and net billing
    const totalBruto = operaciones.reduce(
      (acc, op) => acc + op.honorarios_brutos,
      0
    );
    const totalNeto = operaciones.reduce((acc, op) => acc + op.valor_neto, 0);

    setFacturacionBruto(totalBruto);
    setFacturacionNeta(totalNeto);
  }, [operaciones]);

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Cuadro Principal</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2">
            <th className="py-2 px-4">Numero de Operaciones</th>
            <th className="py-2 px-4">Puntas</th>
            <th className="py-2 px-4">Facturación Total Bruto</th>
            <th className="py-2 px-4">Facturación Neta</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 px-4">{numeroOperaciones}</td>
            <td className="py-2 px-4">{puntas}</td>
            <td className="py-2 px-4">{facturacionBruto.toFixed(2)}</td>
            <td className="py-2 px-4">{facturacionNeta.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CuadroPrincipal;
