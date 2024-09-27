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
import Loader from "./Loader";
import { useOperationsStore } from "@/stores/operationsStore";
import { useUserStore } from "@/stores/authStore";

interface Operacion {
  id: string; // assuming each operation has a unique ID
  tipo_operacion: string; // assuming this field exists for the type of operation
  punta_compradora: boolean;
  punta_vendedora: boolean;
  valor_reserva: number;
  honorarios_brutos: number;
  valor_neto: number;
}

const CuadroPrincipalChart = () => {
  const { userID } = useUserStore();
  const { isLoading } = useOperationsStore();
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

  const COLORS = [
    "#F9D77EB3",
    "#5DADE2B3",
    "#C25B33B3",
    "#1E8449B3",
    "#5DADE299",
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-md w-full">
      <h2 className="text-2xl text-center font-semibold mb-6 text-gray-800">
        Tipo de Operaciones
      </h2>
      {tiposOperaciones.length === 0 ? (
        <p className="text-center text-gray-600">No existen operaciones</p>
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
                  paddingTop: "20px",
                  fontSize: "14px",
                  fontWeight: "bold",
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
