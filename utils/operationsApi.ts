import axios from "axios";
import { Operation } from "@/types";

export const fetchUserOperations = async (
  userUID: string
): Promise<Operation[]> => {
  const response = await axios.get(`/api/operations?user_uid=${userUID}`);
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
