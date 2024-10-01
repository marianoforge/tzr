import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const expensesCollection = collection(db, "expenses");
      const expenseSnapshot = await getDocs(expensesCollection);
      const expenses = expenseSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return res.status(500).json({ message: "Error fetching expenses" });
    }
  } else if (req.method === "POST") {
    const {
      date,
      amount,
      amountInDollars,
      expenseType,
      description,
      dollarRate,
      user_uid,
      otherType,
    } = req.body;

    if (!user_uid) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    try {
      const dataToSubmit = {
        date,
        amount,
        amountInDollars,
        expenseType,
        description,
        dollarRate,
        user_uid,
        otherType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, "expenses"), dataToSubmit);

      res.status(201).json({ message: "Expense successfully saved" });
    } catch (error) {
      console.error("Error saving expense:", error);
      res.status(500).json({ message: "Error saving expense" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
