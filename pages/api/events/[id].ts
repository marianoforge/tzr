import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const docRef = doc(db, "events", id as string);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.status(200).json(docSnap.data());
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching event" });
    }
  } else if (req.method === "PUT") {
    const { title, date, startTime, endTime, description } = req.body;

    try {
      const docRef = doc(db, "events", id as string);
      await updateDoc(docRef, {
        title,
        date,
        startTime,
        endTime,
        description,
        updatedAt: new Date(),
      });

      res.status(200).json({ message: "Event updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating event" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
