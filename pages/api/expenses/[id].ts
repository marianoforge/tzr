// pages/api/expenses/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { ExpenseFormData } from '@/common/types/';
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

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res
        .status(400)
        .json({ message: 'Expense ID is required and must be a string' });
    }

    switch (req.method) {
      case 'GET':
        return getExpenseById(id, res);
      case 'PUT':
        return updateExpense(id, req.body, res);
      case 'DELETE':
        return deleteExpense(id, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getExpenseById = async (id: string, res: NextApiResponse) => {
  try {
    const docRef = doc(db, 'expenses', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    return res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Error fetching expense:', error);
    return res.status(500).json({ message: 'Error fetching expense' });
  }
};

const updateExpense = async (
  id: string,
  updatedData: ExpenseFormData,
  res: NextApiResponse
) => {
  try {
    const docRef = doc(db, 'expenses', id);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date(),
    });
    return res.status(200).json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({ message: 'Error updating expense' });
  }
};

const deleteExpense = async (id: string, res: NextApiResponse) => {
  try {
    const docRef = doc(db, 'expenses', id);
    await deleteDoc(docRef);
    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ message: 'Error deleting expense' });
  }
};
