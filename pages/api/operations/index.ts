import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const operationsCollection = collection(db, "operations");
      const operationSnapshot = await getDocs(operationsCollection);
      const operations = operationSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json(operations);
    } catch (error) {
      console.error("Error fetching operations:", error);
      return res.status(500).json({ message: "Error fetching operations" });
    }
  } else if (req.method === "POST") {
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
      return res.status(401).json({ message: "User not authenticated" });
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
          parseFloat(porcentaje_honorarios_broker) || 0,
        honorarios_broker: parseFloat(honorarios_broker) || 0,
        honorarios_asesor: parseFloat(honorarios_asesor) || 0,
        referido,
        compartido,
        user_uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        estado,
      };

      await addDoc(collection(db, "operations"), dataToSubmit);

      res.status(201).json({ message: "Operation successfully saved" });
    } catch (error) {
      console.error("Error saving operation:", error);
      res.status(500).json({ message: "Error saving operation" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
