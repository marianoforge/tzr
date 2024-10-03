import { useOperationsStore } from "@/stores/useOperationsStore";
import React from "react";
import Loader from "./Loader";
import { formatValue } from "@/utils/formatValue";

const Bubbles = () => {
  const { totals, isLoading } = useOperationsStore();

  const bubbleData = [
    {
      title: "Honorarios Totales Netos (Asesor)",
      figure: formatValue(totals.honorarios_asesor, "currency"),
      bgColor: "bg-lightBlue",
      textColor: "text-white",
    },
    {
      title: "Honorarios Totales Brutos",
      figure: formatValue(totals.honorarios_broker, "currency"),
      bgColor: "bg-darkBlue",
      textColor: "text-white",
    },
    {
      title: "Monto Total de Operaciones Efectuadas",
      figure: formatValue(totals.valor_reserva, "currency"),
      bgColor: "bg-lightBlue",
      textColor: "text-white",
    },
    {
      title: "Cantidad Total de Puntas",
      figure: formatValue(totals.suma_total_de_puntas, "none"),
      bgColor: "bg-darkBlue",
      textColor: "text-white",
    },
    {
      title: "Promedio Valor Operación",
      figure: formatValue(totals.promedio_valor_reserva, "currency"),
      bgColor: "bg-lightBlue",
      textColor: "text-white",
    },
    {
      title: "Cantidad de Operaciones Efectuadas",
      figure: formatValue(totals.cantidad_operaciones, "none"),
      bgColor: "bg-darkBlue",
      textColor: "text-white",
    },
  ];

  return isLoading ? (
    <Loader />
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-md min-h-[450px]">
      {bubbleData.map((data, index) => (
        <div
          key={index}
          className={`${data.bgColor} rounded-xl py-6 text-center shadow-md flex flex-col justify-around items-center h-[200px]`}
        >
          <p className="text-xl text-white sm:text-base lg:text-lg xl:text-lg 2xl:text-base font-semibold h-1/2 items-center justify-center flex">
            {data.title}
          </p>
          <p
            className={`text-[40px] sm:text-xl lg:text-[22px] xl:text-[24px] font-bold ${data.textColor} h-1/2 items-center justify-center flex`}
          >
            {data.figure}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Bubbles;
