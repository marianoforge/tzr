import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { agenciaBroker } = req.query;

  if (req.method === "GET") {
    if (!agenciaBroker || typeof agenciaBroker !== "string") {
      return res
        .status(400)
        .json({ message: "agenciaBroker is required and must be a string" });
    }

    try {
      console.log(`Fetching users with agenciaBroker: ${agenciaBroker}`);
      const usersRef = collection(db, "usuarios");
      const q = query(usersRef, where("agenciaBroker", "==", agenciaBroker));
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs.map((doc) => doc.data());
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}