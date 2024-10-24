import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { calculateTotals } from "@/utils/calculations";
import SkeletonLoader from "@/components/TrackerComponents/SkeletonLoader";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuthStore } from "@/stores/authStore";
import { formatValue } from "@/utils/formatValue";
import { Tooltip } from "react-tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/solid"; // Import Heroicons icon
import { currentYearOperations } from "@/utils/currentYearOps";

const Bubbles = () => {
  const { userID } = useAuthStore();

  // Utilizamos Tanstack Query para obtener las operaciones y calcular los totales
  const {
    data: operations = [],
    isLoading,
    error: operationsError,
  } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID,
  });

  // Calculamos los totales basados en las operaciones filtradas
  const totals = calculateTotals(currentYearOperations(operations));

  const bubbleData = [
    {
      title: "Honorarios Totales Netos - Asesor / Broker",
      figure: formatValue(totals.honorarios_asesor_cerradas ?? 0, "currency"),
      bgColor: "bg-lightBlue",
      textColor: "text-white",
      tooltip:
        "Este es el monto total de honorarios netos obtenidos por el asesor o broker.",
    },
    {
      title: "Honorarios Totales Brutos",
      figure: formatValue(totals.honorarios_broker_cerradas ?? 0, "currency"),
      bgColor: "bg-darkBlue",
      textColor: "text-white",
      tooltip: "Este es el monto total de honorarios brutos.",
    },
    {
      title: "Monto Total de Operaciones Cerradas",
      figure: formatValue(totals.valor_reserva_cerradas ?? 0, "currency"),
      bgColor: "bg-lightBlue",
      textColor: "text-white",
      tooltip: "Este es el valor total de las operaciones cerradas.",
    },
    {
      title: "Cantidad Total de Puntas",
      figure: formatValue(totals.suma_total_de_puntas, "none"),
      bgColor: "bg-darkBlue",
      textColor: "text-white",
      tooltip: "Número total de puntas realizadas.",
    },
    {
      title: "Promedio Valor Operación",
      figure: formatValue(
        totals.total_valor_ventas_desarrollos ?? 0,
        "currency"
      ),
      bgColor: "bg-lightBlue",
      textColor: "text-white",
      tooltip: "Promedio del valor de las operaciones efectuadas.",
    },
    {
      title: "Cantidad de Operaciones Cerradas",
      figure: formatValue(totals.cantidad_operaciones, "none"),
      bgColor: "bg-darkBlue",
      textColor: "text-white",
      tooltip: "Número total de operaciones efectuadas cerradas.",
    },
  ];

  if (isLoading) {
    return <SkeletonLoader height={220} count={2} />;
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || "An unknown error occurred"}</p>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md min-h-[450px] flex justify-center items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        {bubbleData.map((data, index) => (
          <div
            key={index}
            className={`${data.bgColor} rounded-xl py-6 text-center shadow-md flex flex-col justify-around items-center h-[200px] relative`}
          >
            {/* Heroicons Info icon with tooltip */}
            <InformationCircleIcon
              className="absolute top-2 right-2 text-white h-5 w-5 cursor-pointer"
              data-tooltip-id={`tooltip-${index}`}
              data-tooltip-content={data.tooltip}
            />

            <p className="text-xl text-white lg:text-lg xl:text-lg 2xl:text-base lg:px-1 font-semibold h-1/2 items-center justify-center flex">
              {data.title}
            </p>
            <p
              className={`text-[40px] lg:text-[30px] xl:text-[20px] 2xl:text-[24px] font-bold ${data.textColor} h-1/2 items-center justify-center flex`}
            >
              {data.figure}
            </p>

            {/* Tooltip for the icon */}
            <Tooltip id={`tooltip-${index}`} place="top" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bubbles;
