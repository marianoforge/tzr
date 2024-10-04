import axios from "axios";
import { Operation } from "@/types";

export const fetchOperations = async (userID: string): Promise<Operation[]> => {
  const response = await axios.get(`/api/operations/user/${userID}`);
  return response.data;
};

export const updateOperationStatus = (
  operations: Operation[],
  id: string,
  newEstado: string
): Operation[] => {
  return operations.map((op) =>
    op.id === id ? { ...op, estado: newEstado } : op
  );
};
