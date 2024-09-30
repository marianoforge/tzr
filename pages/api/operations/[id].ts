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
    console.log(req.body);
    const {
      fecha_operacion,
      direccion_reserva,
      tipo_operacion,
      estado,
      valor_reserva,
      punta_compradora,
      punta_vendedora,
      numero_sobre_reserva,
      numero_sobre_refuerzo,
      porcentaje_honorarios_asesor,
      porcentaje_honorarios_broker,
      honorarios_broker,
      honorarios_asesor,
      porcentaje_punta_compradora,
      porcentaje_punta_vendedora,
      referido,
      compartido,
    } = req.body;

    if (
      !fecha_operacion &&
      !direccion_reserva &&
      !tipo_operacion &&
      !estado &&
      !valor_reserva &&
      !punta_compradora &&
      !punta_vendedora &&
      !numero_sobre_reserva &&
      !numero_sobre_refuerzo &&
      !porcentaje_honorarios_asesor &&
      !porcentaje_honorarios_broker &&
      !porcentaje_punta_compradora &&
      !porcentaje_punta_vendedora &&
      !honorarios_broker &&
      !honorarios_asesor &&
      !referido &&
      !compartido
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
        ...(punta_compradora !== undefined && { punta_compradora }),
        ...(punta_vendedora !== undefined && { punta_vendedora }),
        ...(numero_sobre_reserva !== undefined && { numero_sobre_reserva }),
        ...(numero_sobre_refuerzo !== undefined && { numero_sobre_refuerzo }),
        ...(porcentaje_honorarios_asesor !== undefined && {
          porcentaje_honorarios_asesor,
        }),
        ...(porcentaje_honorarios_broker !== undefined && {
          porcentaje_honorarios_broker,
        }),
        ...(porcentaje_punta_compradora !== undefined && {
          porcentaje_punta_compradora,
        }),
        ...(porcentaje_punta_vendedora !== undefined && {
          porcentaje_punta_vendedora,
        }),
        ...(honorarios_broker !== undefined && { honorarios_broker }),
        ...(honorarios_asesor !== undefined && { honorarios_asesor }),
        ...(referido && { referido }),
        ...(compartido && { compartido }),
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
