import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import Loader from "../Loader";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { Operation } from "@/types";
import { COLORS } from "@/lib/constants";
import { fetchUserOperations } from "@/lib/api/operationsApi";

const CuadroPrincipalChart = () => {
  const { userID } = useAuthStore();
  const [tiposOperaciones, setTiposOperaciones] = useState<
    { name: string; value: number }[]
  >([]);

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID, // Solo hacer la petición si hay un userID
  });

  useEffect(() => {
    if (operations.length > 0) {
      calculateTotals(operations);
    }
  }, [operations]);

  const calculateTotals = (operations: Operation[]) => {
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

  return (
    <div className="bg-white p-3 rounded-xl shadow-md w-full">
      {isLoading ? (
        <Loader />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default CuadroPrincipalChart;
