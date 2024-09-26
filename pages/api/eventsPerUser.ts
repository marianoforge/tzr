import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { user_uid } = req.query;

  if (!user_uid) {
    return res.status(400).json({ message: "Se requiere el UID del usuario" });
  }

  try {
    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef,
      where("user_uid", "==", user_uid),
      orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ message: "Error al obtener eventos del usuario" });
  }
}
