import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { user_uid } = req.query;

  if (!user_uid || typeof user_uid !== "string") {
    return res.status(400).json({ message: "Invalid user_uid" });
  }

  try {
    const userRef = doc(db, "usuarios", user_uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      const responseData = {
        email: userData.email || null,
        numeroTelefono: userData.numero_telefono || null,
        comision: userData.comision || null,
        firstName: userData.name || null, // Cambiado de userData.firstName a userData.name
        lastName: userData.lastName || null,
      };

      res.status(200).json(responseData);
    } else {
      console.log("No user data found for UID:", user_uid);
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
}
