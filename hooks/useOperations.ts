import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { Operation } from "@/types";
import { useOperationsStore } from "@/stores/useOperationsStore";

export const useOperations = () => {
  const { operations, setItems, calculateTotals, isLoading, fetchItems } =
    useOperationsStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  useEffect(() => {
    const fetchOperations = async () => {
      if (!userUID) return;

      try {
        const response = await axios.get(`/api/operations/user/${userUID}`);
        if (response.status !== 200) {
          throw new Error("Error al obtener las operaciones del usuario");
        }
        setItems(response.data);
        calculateTotals();
      } catch (error) {
        console.error("Error al obtener las operaciones:", error);
      }
    };

    fetchOperations();
  }, [userUID, setItems, calculateTotals]);

  const handleEstadoChange = async (id: string, currentEstado: string) => {
    const newEstado = currentEstado === "En Curso" ? "Cerrada" : "En Curso";
    try {
      const response = await axios.put(`/api/operations/${id}`, {
        estado: newEstado,
      });

      if (response.status !== 200) {
        throw new Error("Error actualizando estado");
      }

      setItems(
        operations.map((op) =>
          op.id === id ? { ...op, estado: newEstado } : op
        )
      );
      calculateTotals();
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  const handleEditClick = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      const response = await axios.delete(`/api/operations/${id}`);
      if (response.status !== 200) {
        throw new Error("Error eliminando operación");
      }
      setItems(operations.filter((op) => op.id !== id));
      calculateTotals();
    } catch (error) {
      console.error("Error eliminando operación:", error);
    }
  };

  return {
    operations,
    userUID,
    isLoading,
    selectedOperation,
    isEditModalOpen,
    handleEstadoChange,
    handleEditClick,
    handleDeleteClick,
    setIsEditModalOpen,
    fetchItems,
  };
};
