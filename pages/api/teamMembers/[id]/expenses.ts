import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { ids } = req.query;

  if (req.method === 'GET') {
    try {
      const teamMemberIds = Array.isArray(ids)
        ? ids
        : ids?.split(',').map((id) => id.trim());
      const usersWithExpenses: any[] = [];

      for (const teamMemberId of teamMemberIds || []) {
        // Obtener los datos del documento principal (nombre, apellido, etc.)
        const teamMemberDocRef = doc(db, `teams`, teamMemberId);
        const teamMemberDocSnapshot = await getDoc(teamMemberDocRef);

        if (!teamMemberDocSnapshot.exists()) {
          console.log(`No se encontró el Team Member con ID: ${teamMemberId}`);
          continue;
        }

        const teamMemberData = teamMemberDocSnapshot.data();

        const { firstName, lastName } = teamMemberData;

        // Obtener los datos de la subcolección `expenses`
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

          // Combinar los datos del miembro del equipo con sus gastos
          usersWithExpenses.push({
            id: teamMemberId,
            firstname: firstName,
            lastname: lastName,
            expenses,
          });
        }
      }

      return res.status(200).json({ usersWithExpenses });
    } catch (error) {
      console.error('Error fetching team members and expenses:', error);
      return res.status(500).json({ message: 'Error al obtener los datos' });
    }
  } else if (req.method === 'POST') {
    const { id: agentId } = req.query;
    const expenseData = req.body;

    console.log('expenseData', expenseData);

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
