import { useOperationsStore } from "@/stores/operationsStore";
import { formatNumber } from "@/utils/formatNumber";
import React from "react";
import Loader from "./Loader";
import ObjectiveChart from "./ObjectiveChart";

const Bubbles = () => {
  const { totals, isLoading } = useOperationsStore();

  const formatValue = (
    value: number | string,
    format: "percentage" | "currency" | "none" = "none"
  ) => {
    if (value === "No Data") return "No Data";

    const numValue = Number(value);
    switch (format) {
      case "percentage":
        return formatNumber(numValue, true);
      case "currency":
        return `$${formatNumber(numValue)}`;
      default:
        return formatNumber(numValue);
    }
  };

  const bubbleData = [
    {
      title: "Honorarios Totales Netos",
      figure: formatValue(totals.valor_neto, "currency"),
      bgColor: "bg-[#F9D77E]/10",
      textColor: "text-[#C7A84E]",
    },
    {
      title: "Porcentaje Prom. Honorarios",
      figure: formatValue(totals.honorarios_brutos, "percentage"),
      bgColor: "bg-[#A8E0FF]/10",
      textColor: "text-[#5EAAD7]",
    },
    {
      title: "Valores Totales de Reservas",
      figure: formatValue(totals.valor_reserva, "currency"),
      bgColor: "bg-[#FFB7B2]/10",
      textColor: "text-[#D98B84]",
    },
    {
      title: "Mayor Venta Efectuada",
      figure: formatValue(totals.mayor_venta_efectuada, "currency"),
      bgColor: "bg-[#BAFFC9]/10",
      textColor: "text-[#7ED994]",
    },
    {
      title: "Promedio de Valor de Reserva",
      figure: formatValue(totals.promedio_valor_reserva, "currency"),
      bgColor: "bg-[#BAE1FF]/10",
      textColor: "text-[#7EAFD7]",
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-md min-h-[450px]">
      {bubbleData.map((data, index) => (
        <div
          key={index}
          className={`${data.bgColor} rounded-lg py-6 text-center shadow-md flex flex-col justify-around items-center h-[200px]`}
        >
          <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-base font-semibold text-gray-700 mb-2">
            {data.title}
          </p>
          <p
            className={`text-2xl sm:text-xl lg:text-[22px] xl:text-[22px] font-bold ${data.textColor}`}
          >
            {data.figure}
          </p>
        </div>
      ))}
      <ObjectiveChart />
    </div>
  );
};

export default Bubbles;
