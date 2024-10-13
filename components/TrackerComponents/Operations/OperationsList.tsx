import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import OperationsContainer from "./OperationsContainer";
import OperationsTable from "./OperationsTable";
import { onAuthStateChanged } from "firebase/auth";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { auth } from "@/lib/firebase";
import { Operation } from "@/types";
import { calculateTotals } from "@/utils/calculations";

interface OperationsCarouselDashProps {
  filter: "all" | "open" | "closed";
  setFilter: React.Dispatch<React.SetStateAction<"all" | "open" | "closed">>;
}

const OperationsList: React.FC<OperationsCarouselDashProps> = ({
  filter,
  setFilter,
}) => {
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["operations", userUID],
    queryFn: () => fetchUserOperations(userUID || ""),
    enabled: !!userUID,
  });

  const filteredOperations = operations.filter((operation: Operation) => {
    if (filter === "all") return true;
    return filter === "open"
      ? operation.estado === "En Curso"
      : operation.estado === "Cerrada";
  });

  return (
    <OperationsContainer
      isLoading={isLoading}
      title="Lista de Operaciones"
      operationsLength={filteredOperations.length}
    >
      <div className="flex justify-center mb-6 mt-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 mx-2 w-[195px] ${
            filter === "all"
              ? "bg-mediumBlue text-white"
              : "bg-lightBlue text-white"
          } rounded-lg`}
        >
          Todas las Operaciones
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`px-4 py-2 mx-2 w-[195px] ${
            filter === "open"
              ? "bg-mediumBlue text-white"
              : "bg-lightBlue text-white"
          } rounded-lg`}
        >
          En curso / Reservas
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-4 py-2 mx-2 w-[195px] ${
            filter === "closed"
              ? "bg-mediumBlue text-white"
              : "bg-lightBlue text-white"
          } rounded-lg`}
        >
          Operaciones Cerradas
        </button>
      </div>
      <OperationsTable filter={filter} totals={calculateTotals(operations)} />
    </OperationsContainer>
  );
};

export default OperationsList;
