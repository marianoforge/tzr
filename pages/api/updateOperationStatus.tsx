import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { id, estado } = req.body;

  if (!id || !estado) {
    return res.status(400).json({ message: "ID y estado son requeridos" });
  }

  try {
    const operationRef = doc(db, "operations", id);
    await updateDoc(operationRef, { estado });

    res.status(200).json({ message: "Estado actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    res.status(500).json({ message: "Error al actualizar el estado" });
  }
}
