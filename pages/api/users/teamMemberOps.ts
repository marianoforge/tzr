import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK
import { setCsrfCookie } from '@/lib/csrf'; // 🔹 Manejo de CSRF Token

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('🔹 Nueva petición a /api/teamMemberOps');

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

    // 🔹 Obtener y validar `teamLeadID`
    const { teamLeadID } = req.query;
    if (!teamLeadID || typeof teamLeadID !== 'string') {
      console.warn('⚠️ teamLeadID es requerido o inválido.');
      return res.status(400).json({ message: 'teamLeadID es requerido' });
    }

    console.log(
      '🔹 Consultando miembros del equipo para teamLeadID:',
      teamLeadID
    );

    // 🔹 Obtener CSRF Token
    const csrfToken = setCsrfCookie(res);

    // 🔹 Consultar miembros del equipo
    const teamsSnapshot = await db
      .collection('teams')
      .where('teamLeadID', '==', teamLeadID)
      .get();
    const teamMembers = teamsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Se encontraron ${teamMembers.length} miembros del equipo.`);

    // 🔹 Obtener operaciones de cada miembro en paralelo
    const membersWithOperations = await Promise.all(
      teamMembers.map(async (member) => {
        const [primarySnapshot, additionalSnapshot] = await Promise.all([
          db.collection('operations').where('user_uid', '==', member.id).get(),
          db
            .collection('operations')
            .where('user_uid_adicional', '==', member.id)
            .get(),
        ]);

        const operaciones = [
          ...primarySnapshot.docs.map((opDoc) => opDoc.data()),
          ...additionalSnapshot.docs.map((opDoc) => opDoc.data()),
        ];

        return { ...member, operaciones };
      })
    );

    console.log(
      `✅ Se recuperaron operaciones para ${membersWithOperations.length} miembros.`
    );

    // 🔹 Retornar datos combinados
    return res.status(200).json({ csrfToken, membersWithOperations });
  } catch (error) {
    console.error(
      '❌ Error obteniendo miembros del equipo y operaciones:',
      error
    );
    return res
      .status(500)
      .json({ message: 'Error fetching team members and operations' });
  }
}
