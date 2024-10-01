import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user_uid } = req.query;

  if (!user_uid) {
    return res.status(400).json({ message: "User UID is required" });
  }

  try {
    const q = query(
      collection(db, "expenses"),
      where("user_uid", "==", user_uid as string),
      orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching expenses" });
  }
}
