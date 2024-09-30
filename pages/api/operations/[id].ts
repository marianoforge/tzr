import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Operation ID is required" });
  }

  if (req.method === "GET") {
    try {
      const operationRef = doc(db, "operations", id);
      const operationSnap = await getDoc(operationRef);

      if (!operationSnap.exists()) {
        return res.status(404).json({ message: "Operation not found" });
      }

      res.status(200).json(operationSnap.data());
    } catch (error) {
      res.status(500).json({ message: "Error fetching operation", error });
    }
  } else if (req.method === "PUT") {
    const {
      fecha_operacion,
      direccion_reserva,
      tipo_operacion,
      estado,
      valor_reserva,
    } = req.body;

    if (
      !fecha_operacion &&
      !direccion_reserva &&
      !tipo_operacion &&
      !estado &&
      !valor_reserva
    ) {
      return res.status(400).json({ message: "No fields to update" });
    }

    try {
      const operationRef = doc(db, "operations", id);
      const updates = {
        ...(fecha_operacion && { fecha_operacion }),
        ...(direccion_reserva && { direccion_reserva }),
        ...(tipo_operacion && { tipo_operacion }),
        ...(estado && { estado }),
        ...(valor_reserva && { valor_reserva }),
        updatedAt: new Date(),
      };
      await updateDoc(operationRef, updates);

      res.status(200).json({ message: "Operation updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating operation", error });
    }
  } else if (req.method === "DELETE") {
    try {
      const operationRef = doc(db, "operations", id);
      await deleteDoc(operationRef);

      res.status(200).json({ message: "Operation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting operation", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
