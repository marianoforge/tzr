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
import Loader from "./Loader";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

interface MonthlyData {
  month: string;
  currentYear: number;
  previousYear: number;
}

const MonthlyBarChart: React.FC = () => {
  const { userID } = useAuthStore();
  const { isLoading } = useOperationsStore();
  const [data, setData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await axios.get(
          `/api/operationsPerUser?user_uid=${userID}`
        );
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

  // Función para formatear los datos a la estructura requerida por el gráfico
  const formatOperationsData = (
    operations: {
      fecha_operacion: string | number | Date;
      valor_neto: number;
    }[]
  ) => {
    // Aquí debes ajustar la lógica para calcular `currentYear` y `previousYear` según tus datos
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    // Generar un objeto base para cada mes con valores iniciales en 0
    const data = months.map((month) => ({
      month,
      currentYear: 0,
      previousYear: 0,
    }));

    // Rellenar los datos de currentYear y previousYear
    operations.forEach(
      (operation: {
        fecha_operacion: string | number | Date;
        valor_neto: number;
      }) => {
        const operationDate = new Date(operation.fecha_operacion);
        const monthIndex = operationDate.getMonth(); // Devuelve un índice de 0 a 11

        // Verifica si la operación es del año actual o del año anterior
        const currentYear = new Date().getFullYear();
        if (operationDate.getFullYear() === currentYear) {
          data[monthIndex].currentYear += operation.valor_neto; // Suma los valores netos del año actual
        } else if (operationDate.getFullYear() === currentYear - 1) {
          data[monthIndex].previousYear += operation.valor_neto; // Suma los valores netos del año anterior
        }
      }
    );

    return data;
  };

  const COLORS = ["#F9D77EB3", "#5DADE2B3"];

  const MAX_BAR_SIZE = 40;

  if (isLoading) {
    return <Loader />;
  }

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
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChart;
