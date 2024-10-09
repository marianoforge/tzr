// pages/api/operations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { Operation } from "@/types";

// Handler para manejar GET y POST en este endpoint
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user_uid =
    req.method === "GET" ? req.query.user_uid : req.body.user_uid;

  // Validar que el user_uid esté presente
  if (!user_uid || typeof user_uid !== "string") {
    return res.status(400).json({ message: "User UID is required" });
  }

  switch (req.method) {
    case "GET":
      return getUserOperations(user_uid, res);
    case "POST":
      return createOperation(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

const getUserOperations = async (userUID: string, res: NextApiResponse) => {
  try {
    const q = query(
      collection(db, "operations"),
      where("user_uid", "==", userUID),
      orderBy("fecha_operacion", "asc")
    );
    const querySnapshot = await getDocs(q);
    const operations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(operations);
  } catch (error) {
    console.error("Error fetching operations:", error);
    return res.status(500).json({ message: "Error fetching operations" });
  }
};

const createOperation = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    fecha_operacion,
    direccion_reserva,
    tipo_operacion,
    valor_reserva,
    user_uid,
    ...rest
  } = req.body;

  if (
    !fecha_operacion ||
    !direccion_reserva ||
    !tipo_operacion ||
    !valor_reserva ||
    !user_uid
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newOperation: Operation = {
      fecha_operacion,
      direccion_reserva,
      tipo_operacion,
      valor_reserva,
      user_uid,
      ...rest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "operations"), newOperation);
    return res
      .status(201)
      .json({ id: docRef.id, message: "Operation created successfully" });
  } catch (error) {
    console.error("Error creating operation:", error);
    return res.status(500).json({ message: "Error creating operation" });
  }
};
