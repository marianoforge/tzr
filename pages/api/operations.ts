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
    punta_compradora,
    punta_vendedora,
    valor_reserva,
    numero_sobre_reserva,
    numero_sobre_refuerzo,
    porcentaje_honorarios_asesor,
    porcentaje_honorarios_broker,
    honorarios_broker,
    honorarios_asesor,
    referido,
    compartido,
    user_uid,
    estado,
  } = req.body;

  if (!user_uid) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    const dataToSubmit = {
      fecha_operacion,
      direccion_reserva,
      tipo_operacion,
      punta_compradora,
      punta_vendedora,
      valor_reserva: parseFloat(valor_reserva) || 0,
      numero_sobre_reserva: parseFloat(numero_sobre_reserva) || 0,
      numero_sobre_refuerzo: parseFloat(numero_sobre_refuerzo) || 0,
      porcentaje_honorarios_asesor:
        parseFloat(porcentaje_honorarios_asesor) || 0,
      porcentaje_honorarios_broker:
        parseFloat(porcentaje_honorarios_broker) || 0, // Added this field
      honorarios_broker: parseFloat(honorarios_broker) || 0,
      honorarios_asesor: parseFloat(honorarios_asesor) || 0,
      referido,
      compartido,
      user_uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      estado,
    };

    // Guardar la operación en Firestore
    await addDoc(collection(db, "operations"), dataToSubmit);

    res.status(201).json({ message: "Operación guardada exitosamente" });
  } catch (error) {
    console.error("Error al guardar la operación:", error);
    res.status(500).json({ message: "Error al guardar la operación" });
  }
}
