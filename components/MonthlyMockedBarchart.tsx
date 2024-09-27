import { useUserStore } from "@/stores/authStore";
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
  ReferenceLine,
} from "recharts";

interface MonthlyData {
  month: string;
  currentYear: number;
  previousYear: number;
}

const MonthlyMockedBarchart: React.FC = () => {
  const { userID } = useUserStore();
  const [data, setData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    const mockData: MonthlyData[] = [
      { month: "Ene", currentYear: 4000, previousYear: 2400 },
      { month: "Feb", currentYear: 3000, previousYear: 1398 },
      { month: "Mar", currentYear: 2000, previousYear: 9800 },
      { month: "Abr", currentYear: 2780, previousYear: 3908 },
      { month: "May", currentYear: 1890, previousYear: 4800 },
      { month: "Jun", currentYear: 2390, previousYear: 3800 },
      { month: "Jul", currentYear: 3490, previousYear: 4300 },
      { month: "Ago", currentYear: 3490, previousYear: 4300 },
      { month: "Sep", currentYear: 3490, previousYear: 4300 },
      { month: "Oct", currentYear: 3490, previousYear: 4300 },
      { month: "Nov", currentYear: 3490, previousYear: 4300 },
      { month: "Dic", currentYear: 3490, previousYear: 4300 },
    ];
    setData(mockData);
  }, [userID]);

  const COLORS = ["#F9D77EB3", "#5DADE2B3"]; // Updated colors to match the image
  const MAX_BAR_SIZE = 40; // Reduced bar size for a closer match to the image

  if (data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Honorarios Netos Mensuales
        </h2>
        <p className="text-gray-600">No existen operaciones</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
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

            <ReferenceLine y={0} stroke="#E5E7EB" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyMockedBarchart;
