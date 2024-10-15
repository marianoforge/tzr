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
  filter: "all" | "open" | "closed" | "currentYear" | "year2023";
  setFilter: React.Dispatch<
    React.SetStateAction<"all" | "open" | "closed" | "currentYear" | "year2023">
  >;
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
    const operationYear = new Date(operation.fecha_operacion).getFullYear();
    const currentYear = new Date().getFullYear();

    if (filter === "all") return true;
    if (filter === "open") return operation.estado === "En Curso";
    if (filter === "closed") return operation.estado === "Cerrada";
    if (filter === "currentYear") return operationYear === currentYear;
    if (filter === "year2023") return operationYear === 2023;
  });

  // Calcular los totales basados en las operaciones filtradas
  const filteredTotals = calculateTotals(filteredOperations);

  return (
    <OperationsContainer
      isLoading={isLoading}
      title="Lista de Operaciones"
      operationsLength={filteredOperations.length}
    >
      <div className="flex justify-center mb-6 mt-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 mx-2 w-[195px] rounded-lg ${
            filter === "all"
              ? "bg-mediumBlue text-white"
              : operations.length === 0
              ? "bg-gray-300 text-gray-500"
              : "bg-lightBlue text-white"
          }`}
          disabled={operations.length === 0}
        >
          Todas las Operaciones
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`px-4 py-2 mx-2 w-[195px] rounded-lg ${
            filter === "open"
              ? "bg-mediumBlue text-white"
              : operations.every(
                  (operation: Operation) => operation.estado !== "En Curso"
                )
              ? "bg-gray-300 text-gray-500"
              : "bg-lightBlue text-white"
          }`}
          disabled={operations.every(
            (operation: Operation) => operation.estado !== "En Curso"
          )}
        >
          En curso / Reservas
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-4 py-2 mx-2 w-[195px] rounded-lg ${
            filter === "closed"
              ? "bg-mediumBlue text-white"
              : operations.every(
                  (operation: Operation) => operation.estado !== "Cerrada"
                )
              ? "bg-gray-300 text-gray-500"
              : "bg-lightBlue text-white"
          }`}
          disabled={operations.every(
            (operation: Operation) => operation.estado !== "Cerrada"
          )}
        >
          Operaciones Cerradas
        </button>
        <button
          onClick={() => setFilter("currentYear")}
          className={`px-4 py-2 mx-2 w-[195px] rounded-lg ${
            filter === "currentYear"
              ? "bg-mediumBlue text-white"
              : operations.every(
                  (operation: Operation) =>
                    new Date(operation.fecha_operacion).getFullYear() !==
                    new Date().getFullYear()
                )
              ? "bg-gray-300 text-gray-500"
              : "bg-lightBlue text-white"
          }`}
          disabled={operations.every(
            (operation: Operation) =>
              new Date(operation.fecha_operacion).getFullYear() !==
              new Date().getFullYear()
          )}
        >
          Año Actual
        </button>
        <button
          onClick={() => setFilter("year2023")}
          className={`px-4 py-2 mx-2 w-[195px] rounded-lg ${
            filter === "year2023"
              ? "bg-mediumBlue text-white"
              : operations.every(
                  (operation: Operation) =>
                    new Date(operation.fecha_operacion).getFullYear() !== 2023
                )
              ? "bg-gray-300 text-gray-500"
              : "bg-lightBlue text-white"
          }`}
          disabled={operations.every(
            (operation: Operation) =>
              new Date(operation.fecha_operacion).getFullYear() !== 2023
          )}
        >
          Año 2023
        </button>
      </div>
      <OperationsTable filter={filter} totals={filteredTotals} />
    </OperationsContainer>
  );
};

export default OperationsList;
