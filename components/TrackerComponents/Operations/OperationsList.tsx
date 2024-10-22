import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import OperationsContainer from "./OperationsContainer";
import OperationsTable from "./OperationsTable";
import { onAuthStateChanged } from "firebase/auth";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { auth } from "@/lib/firebase";
import { Operation } from "@/types";

interface OperationsCarouselDashProps {
  filter: "all" | "open" | "closed" | "currentYear" | "year2023";
}

const OperationsList: React.FC<OperationsCarouselDashProps> = ({ filter }) => {
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

  return (
    <OperationsContainer
      isLoading={isLoading}
      title="Lista de Operaciones"
      operationsLength={filteredOperations.length}
    >
      <OperationsTable />
    </OperationsContainer>
  );
};

export default OperationsList;
