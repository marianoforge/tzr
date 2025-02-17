import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/lib/firebase'; // Asegúrate de que este importa correctamente tu instancia de Firestore
import { adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Importar Firebase Admin para autenticación
import { setCsrfCookie } from '@/lib/csrf'; // Asegúrate de tener configurado el CSRF correctamente

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // 🔹 Validar el token de Firebase para autenticación
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
          .status(401)
          .json({ message: 'Unauthorized: No token provided' });
      }

      const token = authHeader.split('Bearer ')[1];
      await adminAuth.verifyIdToken(token);

      // Set CSRF token cookie
      const csrfToken = setCsrfCookie(res);

      // Obtener el teamLeadID desde el query de la request
      const { teamLeadID } = req.query;
      if (!teamLeadID) {
        return res.status(400).json({ message: 'teamLeadID es requerido' });
      }

      // Obtener los miembros del equipo desde la colección 'teams' usando el teamLeadID
      const teamsQuery = query(
        collection(db, 'teams'),
        where('teamLeadID', '==', teamLeadID)
      );
      const teamsSnapshot = await getDocs(teamsQuery);

      const teamMembers = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const membersWithOperations = await Promise.all(
        teamMembers.map(async (member) => {
          const primaryQuery = query(
            collection(db, 'operations'),
            where('user_uid', '==', member.id)
          );
          const primarySnapshot = await getDocs(primaryQuery);

          // Query for operations where the member is the additional user
          const additionalQuery = query(
            collection(db, 'operations'),
            where('user_uid_adicional', '==', member.id)
          );
          const additionalSnapshot = await getDocs(additionalQuery);

          // Combine operations from both queries
          const operaciones = [
            ...primarySnapshot.docs.map((opDoc) => opDoc.data()),
            ...additionalSnapshot.docs.map((opDoc) => opDoc.data()),
          ];

          return { ...member, operaciones };
        })
      );

      // Devolver los miembros del equipo junto con sus operaciones
      return res.status(200).json({ csrfToken, membersWithOperations });
    } catch (error) {
      console.error('Error fetching team members and operations:', error);
      return res
        .status(500)
        .json({ message: 'Error fetching team members and operations' });
    }
  }

  // Return 405 for unsupported methods
  return res.status(405).json({ message: 'Method not allowed' });
}
