import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK

type TeamMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  [key: string]: string | Operation[]; // Extendable properties
};

type Operation = {
  id: string;
  user_uid: string;
  user_uid_adicional?: string | null; // ✅ Permite que sea string o null
} & {
  [key: string]: string | Operation[] | undefined; // ✅ Permite valores undefined sin error
};

type TeamMemberWithOperations = TeamMember & {
  operations: Operation[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/getTeamsWithOperations', req.method);

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

    // 🔹 Paso 1: Obtener miembros del equipo y operaciones en paralelo
    const [teamMembersSnapshot, operationsSnapshot] = await Promise.all([
      db.collection('teams').get(),
      db.collection('operations').get(),
    ]);

    console.log('✅ Datos de equipos y operaciones obtenidos.');

    const teamMembers: TeamMember[] = teamMembersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TeamMember[];

    const operations: Operation[] = operationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      user_uid: doc.data().user_uid,
      user_uid_adicional: doc.data().user_uid_adicional ?? null, // ✅ Asegura que no sea undefined
      ...doc.data(),
    })) as Operation[];

    // 🔹 Paso 2: Combinar datos
    const result: TeamMemberWithOperations[] = teamMembers.map((member) => {
      const memberOperations = operations.filter(
        (op) => op.user_uid === member.id || op.user_uid_adicional === member.id
      );

      return { ...member, operations: memberOperations };
    });

    console.log(
      `✅ Datos combinados: ${result.length} equipos con operaciones.`
    );

    // 🔹 Paso 3: Responder con los datos combinados
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error en la API /api/getTeamsWithOperations:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
