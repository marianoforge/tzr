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

interface MonthlyBarChartProps {
  userId: string;
}

interface MonthlyData {
  month: string;
  currentYear: number;
  previousYear: number;
}

const MonthlyMockedBarchart = ({ userId }: MonthlyBarChartProps) => {
  const [data, setData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    // Aquí deberías hacer una llamada a tu API para obtener los datos reales
    // Por ahora, usaremos datos de ejemplo
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
  }, [userId]);

  const COLORS = ["#F9D77E", "#A8E0FF"]; // Updated colors to match the image
  const MAX_BAR_SIZE = 40; // Reduced bar size for a closer match to the image

  if (data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow-md w-full">
        <h2 className="text-2xl font-bold mb-4">Honorarios Netos Mensuales</h2>
        <p className="text-center text-gray-600">No existen operaciones</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
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

export default MonthlyMockedBarchart;
