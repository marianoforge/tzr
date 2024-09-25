import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const eventsCollection = collection(db, "events");
      const eventSnapshot = await getDocs(eventsCollection);
      const events = eventSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({ message: "Error fetching events" });
    }
  } else if (req.method === "POST") {
    const { title, date, startTime, endTime, description, user_uid } = req.body;

    if (!user_uid) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    try {
      const dataToSubmit = {
        title,
        date,
        startTime,
        endTime,
        description,
        user_uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Guardar el evento en Firestore
      await addDoc(collection(db, "events"), dataToSubmit);

      res.status(201).json({ message: "Evento guardado exitosamente" });
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      res.status(500).json({ message: "Error al guardar el evento" });
    }
  } else {
    return res.status(405).json({ message: "Método no permitido" });
  }
}
