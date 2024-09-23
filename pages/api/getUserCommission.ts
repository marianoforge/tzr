// pages/api/getUserCommission.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { user_uid } = req.query;

  if (!user_uid) {
    return res.status(400).json({ message: "UID del usuario es requerido" });
  }

  try {
    // Obtener el documento del usuario desde Firestore
    const userDoc = await getDoc(doc(db, "usuarios", user_uid as string));

    if (!userDoc.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Extraer la comisión del documento
    const userData = userDoc.data();
    const comision = userData?.comision || 0;

    res.status(200).json({ comision });
  } catch (error) {
    console.error("Error al obtener la comisión del usuario:", error);
    res
      .status(500)
      .json({ message: "Error al obtener la comisión del usuario" });
  }
}
