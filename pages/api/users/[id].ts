import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (req.method === "GET") {
    try {
      console.log(`Fetching user data for ID: ${id}`); // Log added
      const userRef = doc(db, "usuarios", id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log(`No user data found for ID: ${id}`); // Log added
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(userSnap.data());
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Error fetching user data", error });
    }
  } else if (req.method === "PUT") {
    const { name, lastName, email, agenciaBroker, numeroTelefono } = req.body;

    if (!name && !lastName && !email && !agenciaBroker && !numeroTelefono) {
      return res.status(400).json({ message: "No fields to update" });
    }

    try {
      const userRef = doc(db, "usuarios", id);
      const updates = {
        ...(name && { name }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(agenciaBroker && { agenciaBroker }),
        ...(numeroTelefono && { numeroTelefono }),
        updatedAt: new Date(),
      };
      await updateDoc(userRef, updates);

      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  } else if (req.method === "DELETE") {
    try {
      const userRef = doc(db, "usuarios", id);
      await deleteDoc(userRef);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}