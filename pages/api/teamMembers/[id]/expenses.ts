import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK
import { getDocs, getDoc, addDoc, deleteDoc } from 'firebase/firestore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/teamExpenses', req.method);

    // 🔹 Validar el token de Firebase para autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No se proporcionó token en la cabecera.');
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log('✅ Token verificado para UID:', decodedToken.uid);

    const { ids, id: agentId, expenseId } = req.query;

    // 🔹 Obtener miembros del equipo con sus gastos
    if (req.method === 'GET') {
      try {
        console.log('🔹 Obteniendo miembros del equipo y sus gastos...');

        const teamMemberIds = Array.isArray(ids)
          ? ids
          : ids?.split(',').map((id) => id.trim());

        if (!teamMemberIds || teamMemberIds.length === 0) {
          console.warn('⚠️ No se proporcionaron IDs de miembros del equipo.');
          return res
            .status(400)
            .json({ message: 'Team member IDs are required' });
        }

        // 🔹 Consultar datos de cada miembro y sus gastos en paralelo
        const teamMemberPromises = teamMemberIds.map(async (teamMemberId) => {
          const teamMemberDoc = await db
            .collection('teams')
            .doc(teamMemberId)
            .get();

          if (!teamMemberDoc.exists) {
            console.warn(
              `⚠️ No se encontró el Team Member con ID: ${teamMemberId}`
            );
            return null;
          }

          const teamMemberData = teamMemberDoc.data();
          if (!teamMemberData) {
            console.warn(
              `⚠️ Datos no disponibles para el Team Member con ID: ${teamMemberId}`
            );
            return null;
          }

          const { firstName = '', lastName = '' } = teamMemberData; // ✅ Evita el error si las propiedades no existen

          // Obtener los gastos asociados a este miembro del equipo
          const expensesSnapshot = await db
            .collection(`teams/${teamMemberId}/expenses`)
            .get();
          const expenses = expensesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          return { id: teamMemberId, firstName, lastName, expenses };
        });

        const usersWithExpenses = (
          await Promise.all(teamMemberPromises)
        ).filter(Boolean);

        console.log(
          `✅ Datos obtenidos para ${usersWithExpenses.length} miembros.`
        );
        return res.status(200).json({ usersWithExpenses });
      } catch (error) {
        console.error(
          '❌ Error obteniendo miembros del equipo y gastos:',
          error
        );
        return res
          .status(500)
          .json({ message: 'Error fetching team members and expenses' });
      }
    }

    // 🔹 Agregar un gasto a un miembro del equipo
    if (req.method === 'POST') {
      if (!agentId || typeof agentId !== 'string') {
        console.warn('⚠️ ID del agente requerido.');
        return res.status(400).json({ message: 'Agent ID is required' });
      }

      const expenseData = req.body;
      if (!expenseData || Object.keys(expenseData).length === 0) {
        console.warn('⚠️ No se proporcionaron datos del gasto.');
        return res.status(400).json({ message: 'Expense data is required' });
      }

      try {
        console.log(`🔹 Agregando gasto para el agente ${agentId}...`);

        const newExpenseRef = await db
          .collection(`teams/${agentId}/expenses`)
          .add({
            ...expenseData,
            createdAt: new Date().toISOString(),
          });

        console.log('✅ Gasto agregado con éxito.');
        return res.status(201).json({
          message: 'Gasto agregado exitosamente',
          id: newExpenseRef.id,
        });
      } catch (error) {
        console.error('❌ Error agregando gasto:', error);
        return res.status(500).json({ message: 'Error adding expense' });
      }
    }

    // 🔹 Eliminar un gasto de un miembro del equipo
    if (req.method === 'DELETE') {
      if (
        !agentId ||
        typeof agentId !== 'string' ||
        !expenseId ||
        typeof expenseId !== 'string'
      ) {
        console.warn('⚠️ Faltan parámetros para eliminar el gasto.');
        return res
          .status(400)
          .json({ message: 'Agent ID and Expense ID are required' });
      }

      try {
        console.log(
          `🔹 Eliminando gasto ${expenseId} del agente ${agentId}...`
        );

        await db.doc(`teams/${agentId}/expenses/${expenseId}`).delete();

        console.log('✅ Gasto eliminado con éxito.');
        return res
          .status(200)
          .json({ message: 'Gasto eliminado exitosamente' });
      } catch (error) {
        console.error('❌ Error eliminando gasto:', error);
        return res.status(500).json({ message: 'Error deleting expense' });
      }
    }

    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Error en la API /api/teamExpenses:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
