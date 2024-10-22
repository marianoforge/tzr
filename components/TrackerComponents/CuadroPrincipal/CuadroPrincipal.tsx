import Loader from "@/components/TrackerComponents/Loader";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { Operation } from "@/types";
import { formatNumber } from "@/utils/formatNumber";
import { calculateTotals } from "@/utils/calculations"; // Import the utility function

const CuadroPrincipal = () => {
  const { userID } = useAuthStore();

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID, // Solo hace la petición si hay un userID
  });

  // Filtrar operaciones cerradas
  const closedOperations = operations.filter(
    (op: Operation) => op.estado === "Cerrada"
  );

  // Use the calculateTotals utility function
  const totals = calculateTotals(closedOperations);

  // Calculate the data for each operation type
  const operationData: Record<
    string,
    { cantidad: number; totalHonorarios: number; totalVenta: number }
  > = closedOperations.reduce(
    (
      acc: Record<
        string,
        { cantidad: number; totalHonorarios: number; totalVenta: number }
      >,
      op: Operation
    ) => {
      if (!acc[op.tipo_operacion]) {
        acc[op.tipo_operacion] = {
          cantidad: 0,
          totalHonorarios: 0,
          totalVenta: 0,
        };
      }
      acc[op.tipo_operacion].cantidad += 1;
      acc[op.tipo_operacion].totalHonorarios += Number(op.honorarios_asesor);
      acc[op.tipo_operacion].totalVenta += Number(op.valor_reserva);
      return acc;
    },
    {} as Record<
      string,
      { cantidad: number; totalHonorarios: number; totalVenta: number }
    >
  );

  const totalCantidad = Object.values(operationData).reduce(
    (acc: number, data: { cantidad: number }) => acc + data.cantidad,
    0
  );

  // Calculate the sum of the last column values
  const totalLastColumnSum = Object.entries(operationData).reduce(
    (acc, [tipo, data]) => {
      if (
        tipo !== "Alquiler" &&
        tipo !== "Cochera" &&
        tipo !== "Alquiler temporal"
      ) {
        return acc + data.totalVenta / data.cantidad;
      }
      return acc;
    },
    0
  );

  // Divide the sum by 2
  const adjustedTotalVentaSum = totalLastColumnSum / 2;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full hidden md:block h-[550px] overflow-y-auto">
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center">
            Cuadro Tipos de Operaciones
          </h2>
          {operations.length === 0 ? (
            <p className="text-center text-gray-600">No existen operaciones</p>
          ) : (
            <div className="overflow-x-auto text-center">
              <table className="w-full text-left border-collapse">
                <thead className="hidden md:table-header-group">
                  <tr className="bg-lightBlue/10 border-b-2 text-center text-sm text-mediumBlue h-16">
                    <th className="py-3 px-4 text-start font-semibold">
                      Tipo de Operacion
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Cantidad de Operaciones
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Porcentaje Sobre el Total
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      % Ganancias Brutas
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      Promedio Monto Ventas & Desarrollos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(operationData).map(([tipo, data], index) => {
                    const typedData = data as {
                      cantidad: number;
                      totalHonorarios: number;
                      totalVenta: number;
                    };
                    return (
                      <tr
                        key={tipo}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-mediumBlue/10"
                        } hover:bg-lightBlue/10 border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out text-center h-16`}
                      >
                        <td className="py-3 px-4 text-start text-base">
                          {tipo}
                        </td>
                        <td className="py-3 px-4 text-base">
                          {typedData.cantidad}
                        </td>
                        <td className="py-3 px-4 text-base">
                          {(
                            (typedData.cantidad / operations.length) *
                            100
                          ).toFixed(2)}
                          %
                        </td>
                        <td className="py-3 px-4 text-base">
                          {(
                            (typedData.totalHonorarios /
                              totals.honorarios_asesor) *
                            100
                          ).toFixed(2)}
                          %
                        </td>
                        <td className="py-3 px-4 text-base">
                          {tipo === "Alquiler" ||
                          tipo === "Cochera" ||
                          tipo === "Alquiler temporal"
                            ? ""
                            : `$${formatNumber(
                                typedData.totalVenta / typedData.cantidad
                              )}`}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="font-bold bg-lightBlue/10 h-16 text-center">
                    <td className="py-3 px-4 text-start text-base">Total</td>
                    <td className="py-3 px-4 text-base">{totalCantidad}</td>
                    <td className="py-3 px-4 text-base"></td>
                    <td className="py-3 px-4 text-base"></td>
                    <td className="py-3 px-4 text-base">
                      ${formatNumber(adjustedTotalVentaSum)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CuadroPrincipal;
