import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { id: agentId } = req.query;
    const expenseData = req.body;

    try {
      const expensesCollection = collection(db, `teams/${agentId}/expenses`);
      const newExpenseRef = await addDoc(expensesCollection, {
        ...expenseData,
        createdAt: new Date(),
      });

      return res.status(201).json({
        message: 'Gasto agregado exitosamente',
        id: newExpenseRef.id,
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      return res.status(500).json({ message: 'Error al agregar el gasto' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}
