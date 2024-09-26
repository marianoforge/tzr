import { useOperationsStore } from "@/stores/operationsStore";
import { formatNumber } from "@/utils/formatNumber";
import React from "react";
import Loader from "./Loader";

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
      title: "Honorarios Totales Netos (Asesor)",
      figure: formatValue(totals.honorarios_asesor, "currency"),
      bgColor: "bg-[#F7B89E]/10",
      textColor: "text-[#C25B33]",
    },
    {
      title: "Honorarios Totales Brutos (Broker)",
      figure: formatValue(totals.honorarios_broker, "currency"),
      bgColor: "bg-[#5DADE2]/10",
      textColor: "text-[#2E86C1]",
    },
    {
      title: "Monto Total de Operaciones Efectuadas",
      figure: formatValue(totals.valor_reserva, "currency"),
      bgColor: "bg-[#F7B89E]/10",
      textColor: "text-[#C25B33]",
    },
    {
      title: "Cantidad Total de Puntas",
      figure: formatValue(totals.suma_total_de_puntas, "none"),
      bgColor: "bg-[#1E8449]/10",
      textColor: "text-[#145A32]",
    },
    {
      title: "Promedio Valor Operación",
      figure: formatValue(totals.promedio_valor_reserva, "currency"),
      bgColor: "bg-[#5DADE2]/10",
      textColor: "text-[#2E86C1]",
    },
    {
      title: "Cantidad de Operaciones Efectuadas",
      figure: formatValue(totals.cantidad_operaciones, "none"),
      bgColor: "bg-[#1E8449]/10",
      textColor: "text-[#145A32]",
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
          <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-base font-semibold text-gray-700  h-1/2 items-center justify-center flex">
            {data.title}
          </p>
          <p
            className={`text-2xl sm:text-xl lg:text-[22px] xl:text-[22px] min-[1700px]:text-[24px] font-bold ${data.textColor} h-1/2 items-center justify-center flex`}
          >
            {data.figure}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Bubbles;
