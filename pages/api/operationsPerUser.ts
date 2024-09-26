import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { user_uid } = req.query;

  if (!user_uid) {
    return res.status(400).json({ message: "Falta el UID del usuario" });
  }

  try {
    const q = query(
      collection(db, "operations"),
      where("user_uid", "==", user_uid)
    );

    const querySnapshot = await getDocs(q);
    const operations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(operations);
  } catch (error) {
    console.error("Error al obtener las operaciones del usuario:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las operaciones del usuario" });
  }
}
