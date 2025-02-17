import type { NextApiRequest, NextApiResponse } from 'next';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
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

    const { ids, id: agentId, expenseId } = req.query;

    if (req.method === 'GET') {
      try {
        const teamMemberIds = Array.isArray(ids)
          ? ids
          : ids?.split(',').map((id) => id.trim());
        const teamMemberPromises = (teamMemberIds || []).map(
          async (teamMemberId) => {
            const teamMemberDocRef = doc(db, `teams`, teamMemberId);
            const teamMemberDocSnapshot = await getDoc(teamMemberDocRef);

            if (!teamMemberDocSnapshot.exists()) {
              console.log(
                `No se encontró el Team Member con ID: ${teamMemberId}`
              );
              return null;
            }

            const teamMemberData = teamMemberDocSnapshot.data();
            const { firstName, lastName } = teamMemberData;

            const expensesCollectionRef = collection(
              db,
              `teams/${teamMemberId}/expenses`
            );
            const expensesSnapshot = await getDocs(expensesCollectionRef);

            if (!expensesSnapshot.empty) {
              const expenses = expensesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              return {
                id: teamMemberId,
                firstname: firstName,
                lastname: lastName,
                expenses,
              };
            }
            return null;
          }
        );

        const usersWithExpenses = (
          await Promise.all(teamMemberPromises)
        ).filter(Boolean);

        return res.status(200).json({ usersWithExpenses });
      } catch (error) {
        console.error('Error fetching team members and expenses:', error);
        return res.status(500).json({ message: 'Error al obtener los datos' });
      }
    } else if (req.method === 'POST') {
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
    } else if (req.method === 'DELETE') {
      const { id: agentId, expenseId } = req.query;

      try {
        if (!agentId || !expenseId) {
          return res.status(400).json({ message: 'Faltan parámetros' });
        }

        const expenseDocRef = doc(db, `teams/${agentId}/expenses/${expenseId}`);
        await deleteDoc(expenseDocRef);

        return res
          .status(200)
          .json({ message: 'Gasto eliminado exitosamente' });
      } catch (error) {
        console.error('Error deleting expense:', error);
        return res.status(500).json({ message: 'Error al eliminar el gasto' });
      }
    } else {
      return res.status(405).json({ message: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
