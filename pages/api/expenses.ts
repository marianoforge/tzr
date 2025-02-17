// pages/api/expenses.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const user_uid =
      req.method === 'GET' ? req.query.user_uid : req.body.user_uid;

    if (!user_uid || typeof user_uid !== 'string') {
      return res.status(400).json({ message: 'User UID is required' });
    }

    switch (req.method) {
      case 'GET':
        return getUserExpenses(user_uid, res);
      case 'POST':
        return createExpense(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getUserExpenses = async (userUID: string, res: NextApiResponse) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('user_uid', '==', userUID),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Error fetching expenses' });
  }
};

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
  } = req.body;

  // Validar que todos los campos requeridos están presentes
  if (!date || !amount || !expenseType || !dollarRate || !user_uid) {
    return res.status(400).json({ message: 'All fields are required' });
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
      otherType: otherType ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Guardar el nuevo gasto en Firestore
    const docRef = await addDoc(collection(db, 'expenses'), newExpense);

    // Retornar una respuesta exitosa con el ID del nuevo documento
    return res
      .status(201)
      .json({ id: docRef.id, message: 'Expense created successfully' });
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ message: 'Error creating expense' });
  }
};
