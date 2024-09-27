// pages/api/updateUserInfo.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase"; // Ajusta esta ruta si es necesario
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Tipo de campos que se pueden actualizar, con índice de string
interface UserUpdates {
  name?: string;
  lastName?: string;
  password?: string;
  agenciaBroker?: string;
  numeroTelefono?: string;
  [key: string]: unknown; // Permite otros campos y anidados si es necesario
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const {
    userID,
    firstName,
    lastName,
    password,
    agenciaBroker,
    numeroTelefono,
  } = req.body;

  if (!userID) {
    return res.status(400).json({ message: "ID de usuario es requerido" });
  }

  try {
    const userRef = doc(db, "usuarios", userID);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Usar el tipo UserUpdates para crear los updates
    const updates: UserUpdates = {};
    if (firstName) updates.name = firstName;
    if (lastName) updates.lastName = lastName;
    if (password) updates.password = password; // Asegúrate de cifrar la contraseña antes de guardar
    if (agenciaBroker) updates.agenciaBroker = agenciaBroker;
    if (numeroTelefono) updates.numeroTelefono = numeroTelefono;

    // Realiza la actualización
    await updateDoc(userRef, updates);

    res.status(200).json({ message: "Información actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar la información del usuario:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar la información del usuario" });
  }
}
