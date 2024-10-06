// pages/api/expenses.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase"; // Asegúrate de que estás utilizando Firestore
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
  // Obtener el user_uid del query
  const user_uid =
    req.method === "GET" ? req.query.user_uid : req.body.user_uid;

  // Validar que el user_uid se ha proporcionado correctamente
  if (!user_uid || typeof user_uid !== "string") {
    return res.status(400).json({ message: "User UID is required" });
  }

  switch (req.method) {
    case "GET":
      // Maneja la obtención de gastos
      return getUserExpenses(user_uid, res);
    case "POST":
      // Maneja la creación de un nuevo gasto
      return createExpense(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

// Obtener los gastos de un usuario
const getUserExpenses = async (userUID: string, res: NextApiResponse) => {
  try {
    const q = query(
      collection(db, "expenses"),
      where("user_uid", "==", userUID),
      orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

// Crear un nuevo gasto
const createExpense = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    date,
    amount,
    amountInDollars,
    expenseType,
    description,
    dollarRate,
    user_uid,
    otherType,
    expenseAssociationType,
  } = req.body;

  // Validar que todos los campos requeridos están presentes
  if (
    !date ||
    !amount ||
    !expenseType ||
    !description ||
    !dollarRate ||
    !user_uid
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Preparar los datos para enviar a Firestore
    const newExpense = {
      date,
      amount,
      amountInDollars,
      expenseType,
      description,
      dollarRate,
      user_uid,
      otherType: otherType ?? "", // Si no está presente, establece como una cadena vacía
      expenseAssociationType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Guardar el nuevo gasto en Firestore
    const docRef = await addDoc(collection(db, "expenses"), newExpense);

    // Retornar una respuesta exitosa con el ID del nuevo documento
    return res
      .status(201)
      .json({ id: docRef.id, message: "Expense created successfully" });
  } catch (error) {
    console.error("Error creating expense:", error);
    return res.status(500).json({ message: "Error creating expense" });
  }
};
