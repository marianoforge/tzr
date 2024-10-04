import { useOperationsStore } from "@/stores/useOperationsStore";
import OperationsTable from "./OperationsTable";
import OperationsContainer from "./OperationsContainer";

const OperationsListDash: React.FC = () => {
  const { operations, totals, isLoading } = useOperationsStore();

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
