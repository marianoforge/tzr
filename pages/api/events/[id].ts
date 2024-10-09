import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json({ message: "Event ID is required and must be a string" });
  }

  switch (req.method) {
    case "GET":
      return getEventById(id, res);
    case "PUT":
      return updateEvent(id, req.body, res);
    case "DELETE":
      return deleteEvent(id, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

const getEventById = async (id: string, res: NextApiResponse) => {
  try {
    const docRef = doc(db, "events", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error fetching event:", error);
    return res.status(500).json({ message: "Error fetching event" });
  }
};

const updateEvent = async (
  id: string,
  updatedData: Partial<{
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }>,
  res: NextApiResponse
) => {
  try {
    const docRef = doc(db, "events", id);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date(),
    });
    return res.status(200).json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({ message: "Error updating event" });
  }
};

const deleteEvent = async (id: string, res: NextApiResponse) => {
  try {
    const docRef = doc(db, "events", id);
    await deleteDoc(docRef);
    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({ message: "Error deleting event" });
  }
};
