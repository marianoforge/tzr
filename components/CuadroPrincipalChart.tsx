// components/CuadroPrincipal.tsx
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface Operacion {
  id: string; // assuming each operation has a unique ID
  tipo_operacion: string; // assuming this field exists for the type of operation
  punta_compradora: boolean;
  punta_vendedora: boolean;
  valor_reserva: number;
  honorarios_brutos: number;
  valor_neto: number;
}

interface CuadroPrincipalProps {
  userID: string;
}

const CuadroPrincipalChart = ({ userID }: CuadroPrincipalProps) => {
  const [tiposOperaciones, setTiposOperaciones] = useState<
    { name: string; value: number }[]
  >([]);

  // Fetch the operations data from your API using the userID
  useEffect(() => {
    const fetchOperaciones = async () => {
      if (!userID) return; // Ensure userID is available before making the request

      try {
        const response = await fetch(
          `/api/operationsPerUser?user_uid=${userID}`
        );
        if (!response.ok) {
          throw new Error("Error fetching operations");
        }

        const data = await response.json();

        calculateTotals(data);
      } catch (error) {
        console.error("Error fetching operations:", error);
      }
    };

    fetchOperaciones();
  }, [userID]);

  const calculateTotals = (operations: Operacion[]) => {
    // Calcular los tipos de operaciones
    const tiposCount = operations.reduce((acc, op) => {
      acc[op.tipo_operacion] = (acc[op.tipo_operacion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tiposData = Object.entries(tiposCount).map(([name, value]) => ({
      name,
      value,
    }));
    setTiposOperaciones(tiposData);
  };

  const COLORS = ["#F9D77E", "#A8E0FF", "#FFB7B2", "#BAFFC9", "#BAE1FF"];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Tipo de Operaciones
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={tiposOperaciones}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {tiposOperaciones.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CuadroPrincipalChart;
