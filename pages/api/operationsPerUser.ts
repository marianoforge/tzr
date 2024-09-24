// pages/api/operationsPerUser.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { user_uid } = req.query;

  if (!user_uid) {
    return res.status(400).json({ message: "User UID is required" });
  }

  try {
    // Query to get operations for the specified user
    const operationsRef = collection(db, "operations");
    const q = query(operationsRef, where("user_uid", "==", user_uid));
    const querySnapshot = await getDocs(q);

    // Map the results to an array of objects
    const operations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(operations);
  } catch (error) {
    console.error("Error fetching operations:", error);
    res.status(500).json({ message: "Error fetching user operations" });
  }
}
