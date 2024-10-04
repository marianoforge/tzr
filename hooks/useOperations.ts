import { useState, useCallback } from "react";
import axios from "axios";
import { Operation } from "@/types";
interface UseOperationsReturn {
  operations: Operation[];
  isLoading: boolean;
  error: string | null;
  fetchOperations: (userID: string) => Promise<void>;
  updateOperationStatus: (id: string, newEstado: string) => void;
}

export const useOperations = (): UseOperationsReturn => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOperations = useCallback(async (userID: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/operations/user/${userID}`);
      setOperations(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOperationStatus = useCallback((id: string, newEstado: string) => {
    setOperations((prevOperations) =>
      prevOperations.map((op) =>
        op.id === id ? { ...op, estado: newEstado } : op
      )
    );
  }, []);

  return {
    operations,
    isLoading,
    error,
    fetchOperations,
    updateOperationStatus,
  };
};
