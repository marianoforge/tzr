import { useQuery } from "@tanstack/react-query";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { calculateTotals } from "@/utils/calculations";
import Loader from "./Loader";
import { useAuthStore } from "@/stores/authStore";
import { formatValue } from "@/utils/formatValue";
import { Operation } from "@/types";

const Bubbles = () => {
  const { userID } = useAuthStore();
  const currentYear = new Date().getFullYear();

  // Utilizamos Tanstack Query para obtener las operaciones y calcular los totales
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID,
  });
  // Filtramos las operaciones para incluir solo las del año corriente
  const currentYearOperations = operations.filter((operation: Operation) => {
    const operationYear = new Date(operation.fecha_operacion).getFullYear();
    return operationYear === currentYear;
  });

  // Calculamos los totales basados en las operaciones filtradas
  const totals = calculateTotals(currentYearOperations);
  console.log(totals);

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
      figure: formatValue(
        totals.total_valor_ventas_desarrollos ?? 0,
        "currency"
      ),
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

  return (
    <div className="bg-white p-4 rounded-xl shadow-md min-h-[450px] justify-center items-center">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          {bubbleData.map((data, index) => (
            <div
              key={index}
              className={`${data.bgColor} rounded-xl py-6 text-center shadow-md flex flex-col justify-around items-center h-[200px]`}
            >
              <p className="text-xl text-white lg:text-lg xl:text-lg 2xl:text-base font-semibold h-1/2 items-center justify-center flex">
                {data.title}
              </p>
              <p
                className={`text-[40px] lg:text-[30px] xl:text-[20px] 2xl:text-[24px] font-bold ${data.textColor} h-1/2 items-center justify-center flex`}
              >
                {data.figure}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bubbles;
