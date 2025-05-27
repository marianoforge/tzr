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
  teamId: string; // ✅ ID del equipo al que pertenece la operación
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

    // Debug: Contar operaciones totales y sin asesor
    const totalOperations = operationsSnapshot.docs.length;
    const operationsForThisTeam = operationsSnapshot.docs.filter(
      (doc) => doc.data().teamId === teamLeaderUID
    );
    const operationsWithoutAdvisor = operationsForThisTeam.filter((doc) => {
      const data = doc.data();
      return !data.user_uid || data.user_uid === '' || data.user_uid === null;
    });

    console.log(`📊 Total operaciones en BD: ${totalOperations}`);
    console.log(
      `📊 Operaciones de este equipo: ${operationsForThisTeam.length}`
    );
    console.log(
      `📊 Operaciones sin asesor en este equipo: ${operationsWithoutAdvisor.length}`
    );

    const teamMembers: TeamMember[] = teamMembersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TeamMember[];

    const operations: Operation[] = operationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      user_uid: doc.data().user_uid,
      user_uid_adicional: doc.data().user_uid_adicional ?? null, // ✅ Asegura que no sea undefined
      teamId: doc.data().teamId, // ✅ Mapear explícitamente el teamId
      ...doc.data(),
    })) as Operation[];

    // 🔹 Paso 2: Verificar si el Team Leader tiene operaciones asignadas
    // Incluir operaciones sin asesor asignado (se asignan automáticamente al Team Leader)
    const teamLeaderOperations = operations.filter((op) => {
      // Verificar que la operación pertenece al equipo del Team Leader
      if (op.teamId !== teamLeaderUID) return false;

      const isPrimaryAdvisor = op.user_uid && op.user_uid === teamLeaderUID;
      const isAdditionalAdvisor =
        op.user_uid_adicional && op.user_uid_adicional === teamLeaderUID;

      // 🚀 NUEVA LÓGICA: Si no hay asesor asignado, la operación va al Team Leader
      const hasNoAdvisorAssigned =
        !op.user_uid || op.user_uid === '' || op.user_uid === null;

      return isPrimaryAdvisor || isAdditionalAdvisor || hasNoAdvisorAssigned;
    });

    // 🔹 Paso 3: Combinar datos de team members
    const result: TeamMemberWithOperations[] = teamMembers.map((member) => {
      const memberOperations = operations.filter((op) => {
        // 🚀 Se asegura que ambos asesores reciban la operación
        const isPrimaryAdvisor = op.user_uid && op.user_uid === member.id;
        const isAdditionalAdvisor =
          op.user_uid_adicional && op.user_uid_adicional === member.id;

        // 🚀 IMPORTANTE: Los team members NO reciben operaciones sin asesor asignado
        // Esas operaciones van automáticamente al Team Leader
        return isPrimaryAdvisor || isAdditionalAdvisor;
      });

      return { ...member, operations: memberOperations };
    });

    // 🔹 Paso 4: Si el Team Leader tiene operaciones, agregarlo a la lista SOLO si no está ya incluido
    if (teamLeaderOperations.length > 0 && teamLeaderSnapshot.exists) {
      // Verificar si el Team Leader ya está en la lista de team members
      const isTeamLeaderAlreadyIncluded = result.some(
        (member) => member.id === teamLeaderUID
      );

      if (!isTeamLeaderAlreadyIncluded) {
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

        // Agregar el Team Leader a la lista (el ordenamiento se hará en el frontend)
        result.push(teamLeaderMember);

        // Debug: Contar operaciones sin asesor asignado
        const operationsWithoutAdvisor = teamLeaderOperations.filter(
          (op) => !op.user_uid || op.user_uid === '' || op.user_uid === null
        );

        console.log(
          `✅ Team Leader agregado con ${teamLeaderOperations.length} operaciones total.`
        );
        console.log(
          `📋 Operaciones sin asesor asignado: ${operationsWithoutAdvisor.length}`
        );
      } else {
        console.log(
          'ℹ️ Team Leader ya está incluido en la lista de team members.'
        );
      }
    }

    console.log(
      `✅ Datos combinados: ${result.length} miembros con operaciones (incluyendo Team Leader si aplica).`
    );

    // Debug: Verificar si hay duplicados
    const memberIds = result.map((member) => member.id);
    const uniqueIds = Array.from(new Set(memberIds));
    if (memberIds.length !== uniqueIds.length) {
      console.warn('⚠️ Se detectaron miembros duplicados en el resultado');
      console.log(
        'IDs duplicados:',
        memberIds.filter((id, index) => memberIds.indexOf(id) !== index)
      );
    }

    // 🔹 Paso 5: Responder con los datos combinados
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error en la API /api/getTeamsWithOperations:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
