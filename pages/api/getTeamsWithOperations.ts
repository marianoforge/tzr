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
    const teamLeaderUID = decodedToken.uid;

    console.log('✅ Token verificado para UID:', teamLeaderUID);

    // 🔹 Paso 1: Obtener miembros del equipo, operaciones y datos del Team Leader en paralelo
    const [teamMembersSnapshot, operationsSnapshot, teamLeaderSnapshot] =
      await Promise.all([
        db.collection('teams').get(),
        db.collection('operations').get(),
        db.collection('usuarios').doc(teamLeaderUID).get(),
      ]);

    console.log('✅ Datos de equipos, operaciones y Team Leader obtenidos.');

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

    // 🔹 Paso 2: Verificar si el Team Leader tiene operaciones asignadas
    const teamLeaderOperations = operations.filter((op) => {
      const isPrimaryAdvisor = op.user_uid && op.user_uid === teamLeaderUID;
      const isAdditionalAdvisor =
        op.user_uid_adicional && op.user_uid_adicional === teamLeaderUID;
      return isPrimaryAdvisor || isAdditionalAdvisor;
    });

    // 🔹 Paso 3: Combinar datos de team members
    const result: TeamMemberWithOperations[] = teamMembers.map((member) => {
      const memberOperations = operations.filter((op) => {
        // 🚀 Se asegura que ambos asesores reciban la operación
        const isPrimaryAdvisor = op.user_uid && op.user_uid === member.id;
        const isAdditionalAdvisor =
          op.user_uid_adicional && op.user_uid_adicional === member.id;

        return isPrimaryAdvisor || isAdditionalAdvisor;
      });

      return { ...member, operations: memberOperations };
    });

    // 🔹 Paso 4: Si el Team Leader tiene operaciones, agregarlo a la lista
    if (teamLeaderOperations.length > 0 && teamLeaderSnapshot.exists) {
      const teamLeaderData = teamLeaderSnapshot.data();
      const teamLeaderMember: TeamMemberWithOperations = {
        id: teamLeaderUID,
        email: teamLeaderData?.email || '',
        firstName: teamLeaderData?.firstName || 'Team',
        lastName: teamLeaderData?.lastName || 'Leader',
        teamLeadID: teamLeaderUID, // El Team Leader se reporta a sí mismo
        numeroTelefono: teamLeaderData?.numeroTelefono || '',
        operations: teamLeaderOperations,
      };

      // Agregar el Team Leader al inicio de la lista para que aparezca primero
      result.unshift(teamLeaderMember);
      console.log(
        `✅ Team Leader agregado con ${teamLeaderOperations.length} operaciones.`
      );
    }

    console.log(
      `✅ Datos combinados: ${result.length} miembros con operaciones (incluyendo Team Leader si aplica).`
    );

    // 🔹 Paso 5: Responder con los datos combinados
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error en la API /api/getTeamsWithOperations:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
