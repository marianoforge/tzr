import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const {
    fecha_operacion,
    direccion_reserva,
    tipo_operacion,
    valor_reserva,
    numero_sobre_reserva,
    numero_sobre_refuerzo,
    porcentaje_honorarios_asesor,
    honorarios_brutos,
    referido,
    compartido,
    valor_neto,
    user_uid,
  } = req.body;

  if (!user_uid) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    const dataToSubmit = {
      fecha_operacion: new Date(fecha_operacion),
      direccion_reserva,
      tipo_operacion,
      valor_reserva: parseFloat(valor_reserva) || 0,
      numero_sobre_reserva: parseFloat(numero_sobre_reserva) || 0,
      numero_sobre_refuerzo: parseFloat(numero_sobre_refuerzo) || 0,
      porcentaje_honorarios_asesor:
        parseFloat(porcentaje_honorarios_asesor) || 0,
      honorarios_brutos: parseFloat(honorarios_brutos) || 0,
      valor_neto: parseFloat(valor_neto) || 0,
      referido,
      compartido,
      user_uid,
      createdAt: new Date(),
    };

    // Guardar la operación en Firestore
    await addDoc(collection(db, "operations"), dataToSubmit);

    res.status(201).json({ message: "Operación guardada exitosamente" });
  } catch (error) {
    console.error("Error al guardar la operación:", error);
    res.status(500).json({ message: "Error al guardar la operación" });
  }
}
