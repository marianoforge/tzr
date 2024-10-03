import { useOperationsStore } from "@/stores/useOperationsStore";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Loader from "../Loader";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import { COLORS, MAX_BAR_SIZE } from "@/lib/constants";
import { formatOperationsData } from "@/utils/formatOperationsData";

const MonthlyBarChart: React.FC = () => {
  const { userID } = useAuthStore();
  const { isLoading } = useOperationsStore();
  const [data, setData] = useState<
    { month: string; currentYear: number; previousYear: number }[]
  >([]);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await axios.get(`/api/operations/user/${userID}`);
        const operations = response.data;

        // Procesa los datos para obtener el formato adecuado
        const formattedData = formatOperationsData(operations);
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching operations:", error);
      }
    };

    fetchOperations();
  }, [userID]);

  if (data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Honorarios Netos Mensuales
        </h2>
        <p className="text-center text-gray-600">No existen operaciones</p>
      </div>
    );
  }

  return isLoading ? (
    <Loader />
  ) : (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Honorarios Netos Mensuales
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={MAX_BAR_SIZE} barGap={5}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar
              dataKey="currentYear"
              fill={COLORS[0]}
              name="Año Actual"
              maxBarSize={MAX_BAR_SIZE}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="previousYear"
              fill={COLORS[1]}
              name="Año Anterior"
              maxBarSize={MAX_BAR_SIZE}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChart;
