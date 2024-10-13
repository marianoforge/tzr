import { useQuery } from "@tanstack/react-query";
import OperationsTable from "./OperationsTable";
import OperationsContainer from "./OperationsContainer";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { useAuthStore } from "@/stores/authStore";
import { calculateTotals } from "@/utils/calculations";

const OperationsListDash: React.FC = () => {
  const { userID } = useAuthStore();

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["operations", userID],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID,
  });

  return (
    <OperationsContainer
      isLoading={isLoading}
      title="Lista de Operaciones"
      operationsLength={operations.length}
    >
      <OperationsTable filter="all" totals={calculateTotals(operations)} />{" "}
    </OperationsContainer>
  );
};

export default OperationsListDash;
