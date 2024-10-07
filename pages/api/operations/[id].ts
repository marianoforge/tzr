// pages/api/operations/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Operation } from "@/types";

// Handler para manejar GET, PUT, DELETE de una operación específica
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json({ message: "Operation ID is required and must be a string" });
  }

  switch (req.method) {
    case "GET":
      return getOperationById(id, res);
    case "PUT":
      return updateOperation(id, req.body, res);
    case "DELETE":
      return deleteOperation(id, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

// Obtener una operación por ID
const getOperationById = async (id: string, res: NextApiResponse) => {
  try {
    const docRef = doc(db, "operations", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ message: "Operation not found" });
    }

    return res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error fetching operation:", error);
    return res.status(500).json({ message: "Error fetching operation" });
  }
};

// Actualizar una operación por ID
const updateOperation = async (
  id: string,
  updatedData: Partial<Operation>,
  res: NextApiResponse
) => {
  try {
    const docRef = doc(db, "operations", id);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });
    return res.status(200).json({ message: "Operation updated successfully" });
  } catch (error) {
    console.error("Error updating operation:", error);
    return res.status(500).json({ message: "Error updating operation" });
  }
};

// Eliminar una operación por ID
const deleteOperation = async (id: string, res: NextApiResponse) => {
  try {
    const docRef = doc(db, "operations", id);
    await deleteDoc(docRef);
    return res.status(200).json({ message: "Operation deleted successfully" });
  } catch (error) {
    console.error("Error deleting operation:", error);
    return res.status(500).json({ message: "Error deleting operation" });
  }
};
