import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin';

interface TeamMember {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  numeroTelefono?: string;
  [key: string]: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/teamAdmin/getTeamData', req.method);

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
    const userUID = decodedToken.uid;

    console.log('✅ Token verificado para UID:', userUID);

    // Verificar rol del usuario
    const userRef = db.collection('usuarios').doc(userUID);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.warn('⚠️ Usuario no encontrado:', userUID);
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userSnap.data();
    if (userData?.role !== 'team_leader_broker') {
      console.warn('⚠️ El usuario no tiene el rol requerido:', userData?.role);
      return res
        .status(403)
        .json({ message: 'Unauthorized: Insufficient permissions' });
    }

    if (req.method === 'GET') {
      // Buscar los miembros del equipo donde teamLeadId === userUID
      const teamsSnapshot = await db
        .collection('teams')
        .where('teamLeadID', '==', userUID)
        .get();

      if (teamsSnapshot.empty) {
        console.log('⚠️ No se encontraron miembros del equipo para el líder');
        return res.status(200).json({ teamMembers: [], operations: [] });
      }

      // Recopilar información de los miembros del equipo
      const teamMembers: TeamMember[] = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(
        `✅ Se encontraron ${teamMembers.length} miembros del equipo`
      );

      // Buscar usuarios correspondientes a los miembros del equipo por email
      const advisorUids: string[] = [];

      // Array para almacenar las promesas de búsqueda de usuario
      const userQueries = teamMembers.map(async (member) => {
        if (member.email) {
          const usuariosSnapshot = await db
            .collection('usuarios')
            .where('email', '==', member.email)
            .get();

          if (!usuariosSnapshot.empty) {
            const advisorUid = usuariosSnapshot.docs[0].id;
            advisorUids.push(advisorUid);
            // Añadir el UID del usuario al miembro del equipo para referencia
            member.advisorUid = advisorUid;
          }
        }
      });

      // Esperar a que todas las consultas de usuario se completen
      await Promise.all(userQueries);

      console.log(
        `✅ Se encontraron ${advisorUids.length} UIDs de asesores correspondientes`
      );

      // Firestore 'in' queries have a limit of 30 values
      // So we need to chunk the array into groups of 30 or less
      const chunkArray = <T>(array: T[], size: number): T[][] => {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
          chunks.push(array.slice(i, i + size));
        }
        return chunks;
      };

      // Si no hay UIDs de asesores, devolver respuesta vacía
      if (advisorUids.length === 0) {
        console.log('⚠️ No se encontraron UIDs de asesores correspondientes');
        return res.status(200).json({ teamMembers, operations: [] });
      }

      // Chunk the advisor UIDs
      const advisorUidChunks = chunkArray(advisorUids, 30);

      // Execute multiple queries for user_uid field and combine results
      const operationsResults = [];

      for (const chunk of advisorUidChunks) {
        const chunkSnapshot = await db
          .collection('operations')
          .where('user_uid', 'in', chunk)
          .get();

        operationsResults.push(...chunkSnapshot.docs);
      }

      // Execute multiple queries for user_uid_adicional field and combine results
      const adicionalOperationsResults = [];

      for (const chunk of advisorUidChunks) {
        const chunkSnapshot = await db
          .collection('operations')
          .where('user_uid_adicional', 'in', chunk)
          .get();

        adicionalOperationsResults.push(...chunkSnapshot.docs);
      }

      // Combine results of both queries, eliminating duplicates by ID
      const operationsMap = new Map();

      [...operationsResults, ...adicionalOperationsResults].forEach((doc) => {
        if (!operationsMap.has(doc.id)) {
          operationsMap.set(doc.id, {
            id: doc.id,
            ...doc.data(),
          });
        }
      });

      const operations = Array.from(operationsMap.values());

      console.log(
        `✅ Se encontraron ${operations.length} operaciones para el equipo`
      );
      return res.status(200).json({ teamMembers, operations });
    }

    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: unknown) {
    console.error('❌ Error en la API /api/teamAdmin/getTeamData:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
