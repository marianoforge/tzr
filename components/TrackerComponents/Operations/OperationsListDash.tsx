import { useQuery } from "@tanstack/react-query";
import OperationsTable from "./OperationsTable";
import OperationsContainer from "./OperationsContainer";
import { fetchUserOperations } from "@/lib/api/operationsApi"; // Corrección del nombre
import { useAuthStore } from "@/stores/authStore";
import { Operation } from "@/types";

const OperationsListDash: React.FC = () => {
  const { userID } = useAuthStore();

  // Utilizamos Tanstack Query para obtener las operaciones del usuario
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""), // Asegúrate de pasar el userID correcto
    enabled: !!userID, // Solo ejecuta si userID está disponible
  });

  // Los totales podrían ser calculados si están disponibles o derivados de las operaciones.
  const totals = operations.reduce(
    (
      acc: {
        valor_reserva: number;
        suma_total_de_puntas: number;
        honorarios_broker: number;
        honorarios_asesor: number;
      },
      operation: Operation
    ) => {
      acc.valor_reserva += Number(operation.valor_reserva);
      acc.suma_total_de_puntas +=
        Number(operation.punta_compradora) + Number(operation.punta_vendedora);
      acc.honorarios_broker += Number(operation.honorarios_broker);
      acc.honorarios_asesor += Number(operation.honorarios_asesor);
      return acc;
    },
    {
      valor_reserva: 0,
      suma_total_de_puntas: 0,
      honorarios_broker: 0,
      honorarios_asesor: 0,
    }
  );

  return (
    <OperationsContainer
      isLoading={isLoading}
      title="Lista de Operaciones"
      operationsLength={operations.length}
    >
      <OperationsTable filter="all" totals={totals} />
    </OperationsContainer>
  );
};

export default OperationsListDash;
