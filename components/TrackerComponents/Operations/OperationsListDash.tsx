import { useOperationsStore } from "@/stores/useOperationsStore";
import Loader from "../Loader";
import OperationsTable from "./OperationsTable";

const OperationsListDash: React.FC = () => {
  const { operations, totals, isLoading } = useOperationsStore();

  return isLoading ? (
    <Loader />
  ) : (
    <div className="bg-white p-6 mt-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Lista de Operaciones
      </h2>
      {operations.length === 0 ? (
        <p className="text-center text-gray-600">No existen operaciones</p>
      ) : (
        <OperationsTable filter="all" operations={operations} totals={totals} />
      )}
    </div>
  );
};

export default OperationsListDash;
