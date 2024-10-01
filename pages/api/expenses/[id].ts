import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const docRef = doc(db, "expenses", id as string);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(200).json(docSnap.data());
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching expense" });
    }
  } else if (req.method === "PUT") {
    const { date, amount, expenseType, description, dollarRate, otherType } =
      req.body;

    try {
      const docRef = doc(db, "expenses", id as string);
      await updateDoc(docRef, {
        date,
        amount,
        expenseType,
        description,
        dollarRate,
        otherType,
        updatedAt: new Date(),
      });

      res.status(200).json({ message: "Expense updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating expense" });
    }
  } else if (req.method === "DELETE") {
    try {
      const docRef = doc(db, "expenses", id as string);
      await deleteDoc(docRef);

      res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting expense" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
