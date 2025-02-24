import type { NextApiRequest, NextApiResponse } from 'next';
import { db, adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firestore Admin SDK
import { setCsrfCookie, validateCsrfToken } from '@/lib/csrf';
import { TeamMemberRequestBody } from '@/common/types/';
import { teamMemberSchema } from '@/common/schemas/teamMemberSchema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔹 Nueva petición a /api/teamMembers', req.method);

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

    if (req.method === 'GET') {
      return getTeamMembers(res);
    }

    if (req.method === 'POST') {
      return createTeamMember(req, res, userUID);
    }

    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Método no permitido' });
  } catch (error) {
    console.error('❌ Error en la API /api/teamMembers:', error);
    return res.status(500).json({ message: 'Error en autenticación' });
  }
}

const getTeamMembers = async (res: NextApiResponse) => {
  try {
    console.log('🔹 Obteniendo miembros del equipo...');

    const csrfToken = setCsrfCookie(res);

    const teamSnapshot = await db.collection('teams').get();
    const teamMembers = teamSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ ${teamMembers.length} miembros del equipo encontrados.`);
    return res.status(200).json({ csrfToken, teamMembers });
  } catch (error) {
    console.error('❌ Error al obtener los miembros del equipo:', error);
    return res
      .status(500)
      .json({ message: 'Error al obtener los miembros del equipo' });
  }
};

const createTeamMember = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userUID: string
) => {
  console.log('🔹 Intentando registrar un nuevo miembro del equipo...');

  // 🔹 Verificar CSRF Token
  const isValidCsrf = validateCsrfToken(req);
  if (!isValidCsrf) {
    console.warn('⚠️ Token CSRF inválido.');
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  const { email, numeroTelefono, firstName, lastName }: TeamMemberRequestBody =
    req.body;

  // Validar que los campos requeridos estén presentes
  if (!firstName || !lastName) {
    console.warn('⚠️ Campos obligatorios faltantes en la creación de equipo.');
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    await teamMemberSchema.validate(req.body, { abortEarly: false });

    const newMemberRef = await db.collection('teams').add({
      email: email || '', // Asegurar que no sea undefined
      numeroTelefono: numeroTelefono || '', // Asegurar que no sea undefined
      firstName,
      lastName,
      teamLeadID: userUID, // 🔹 Aseguramos que el usuario autenticado sea el líder del equipo
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Usuario registrado exitosamente con ID:', newMemberRef.id);
    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      id: newMemberRef.id,
    });
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    return res.status(500).json({ message: 'Error al registrar usuario' });
  }
};
