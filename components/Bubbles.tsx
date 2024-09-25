import { useOperationsStore } from "@/stores/operationsStore";
import { formatNumber } from "@/utils/formatNumber";
import React from "react";
import Loader from "./Loader";

const Bubbles = () => {
  const { totals, isLoading } = useOperationsStore();

  const totalValorNeto = totals.valor_neto;
  const totalHonorariosBrutos = totals.honorarios_brutos;
  const totalValorReserva = totals.valor_reserva;
  const mayorVentaEfectuada = totals.mayor_venta_efectuada;
  const promedioValorReserva = totals.promedio_valor_reserva;

  const bubbleData = [
    {
      title: "Honorarios Totales Netos",
      figure: `$${formatNumber(totalValorNeto)}`,
      bgColor: "bg-[#F9D77E]/10",
      textColor: "text-[#C7A84E]",
    },
    {
      title: "Promedio Porcentual Honorarios Agencia",
      figure: `${formatNumber(totalHonorariosBrutos)}%`,
      bgColor: "bg-[#A8E0FF]/10",
      textColor: "text-[#5EAAD7]",
    },
    {
      title: "Valores Totales de Reservas",
      figure: `$${formatNumber(totalValorReserva)}`,
      bgColor: "bg-[#FFB7B2]/10",
      textColor: "text-[#D98B84]",
    },
    {
      title: "Mayor Venta Efectuada",
      figure: `$${formatNumber(mayorVentaEfectuada)}`,
      bgColor: "bg-[#BAFFC9]/10",
      textColor: "text-[#7ED994]",
    },
    {
      title: "Promedio de Valor de Reserva",
      figure: `$${formatNumber(promedioValorReserva)}`,
      bgColor: "bg-[#BAE1FF]/10",
      textColor: "text-[#7EAFD7]",
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4  bg-white px-5 py-8 rounded-lg">
      {bubbleData.slice(0, 3).map((data, index) => (
        <div
          key={index}
          className={`${data.bgColor} rounded-lg p-6 text-center shadow-md`}
        >
          <p className="text-lg font-semibold text-gray-700 mb-3">
            {data.title}
          </p>
          <p className={`text-2xl font-bold ${data.textColor}`}>
            {data.figure}
          </p>
        </div>
      ))}
      <div className="col-span-1 sm:col-span-3 flex justify-center gap-4">
        {bubbleData.slice(3).map((data, index) => (
          <div
            key={index + 3}
            className={`${data.bgColor} rounded-lg p-6 text-center shadow-md w-full sm:w-[calc(33.333%-0.5rem)]`}
          >
            <p className="text-lg font-semibold text-gray-700 mb-3">
              {data.title}
            </p>
            <p className={`text-2xl font-bold ${data.textColor}`}>
              {data.figure}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bubbles;
