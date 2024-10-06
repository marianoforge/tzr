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

// Handler para manejar GET y POST en este endpoint
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user_uid =
    req.method === "GET" ? req.query.user_uid : req.body.user_uid;

  if (!user_uid || typeof user_uid !== "string") {
    return res.status(400).json({ message: "User UID is required" });
  }

  switch (req.method) {
    case "GET":
      return getUserEvents(user_uid, res);
    case "POST":
      return createEvent(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

// Obtener eventos de un usuario
const getUserEvents = async (userUID: string, res: NextApiResponse) => {
  try {
    const q = query(
      collection(db, "events"),
      where("user_uid", "==", userUID),
      orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
};

// Crear un nuevo evento
const createEvent = async (req: NextApiRequest, res: NextApiResponse) => {
  const { title, date, startTime, endTime, description, user_uid } = req.body;

  // Verificación: validar que todos los campos estén presentes, incluido el user_uid
  if (!title || !date || !startTime || !endTime || !description || !user_uid) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios, incluyendo el user_uid",
    });
  }

  try {
    const newEvent = {
      title,
      date,
      startTime,
      endTime,
      description,
      user_uid, // user_uid debería ser incluido aquí
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "events"), newEvent);

    return res
      .status(201)
      .json({ id: docRef.id, message: "Evento creado con éxito" });
  } catch (error) {
    console.error("Error al crear el evento:", error);
    return res.status(500).json({ message: "Error al crear el evento" });
  }
};
