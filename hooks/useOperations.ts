import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { Operation } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserOperations,
  updateOperation,
  deleteOperation,
} from "@/lib/api/operationsApi";

export const useOperations = () => {
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Watch for user auth state changes
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

  // Fetch operations using Tanstack Query
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["operations", userUID],
    queryFn: () => fetchUserOperations(userUID || ""),
    enabled: !!userUID, // Only fetch if userUID is available
  });

  // Mutation to update operation state
  const updateMutation = useMutation({
    mutationFn: updateOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", userUID] });
    },
  });

  // Mutation to delete an operation
  const deleteMutation = useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations", userUID] });
    },
  });

  const handleEstadoChange = async (id: string, currentEstado: string) => {
    const newEstado = currentEstado === "En Curso" ? "Cerrada" : "En Curso";
    try {
      await updateMutation.mutateAsync({ id, data: { estado: newEstado } });
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
      await deleteMutation.mutateAsync(id);
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
  };
};
