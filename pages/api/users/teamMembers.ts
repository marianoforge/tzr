import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Importamos Firebase Admin para verificar tokens
import { setCsrfCookie, validateCsrfToken } from '@/lib/csrf';
import { TeamMemberRequestBody } from '@/common/types/';
import { teamMemberSchema } from '@/common/schemas/teamMemberSchema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 🔹 Verificar el token de autenticación de Firebase
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID = decodedToken.uid;

    if (req.method === 'GET') {
      return getTeamMembers(res);
    }

    if (req.method === 'POST') {
      return createTeamMember(req, res, userUID);
    }

    return res.status(405).json({ message: 'Método no permitido' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Error en autenticación' });
  }
}

const getTeamMembers = async (res: NextApiResponse) => {
  try {
    const token = setCsrfCookie(res);

    const teamCollection = collection(db, 'teams');
    const teamSnapshot = await getDocs(teamCollection);
    const teamMembers = teamSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ csrfToken: token, teamMembers });
  } catch (error) {
    console.error(error);
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
  // 🔹 Verificar CSRF Token
  const isValidCsrf = validateCsrfToken(req);
  if (!isValidCsrf) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  const { email, numeroTelefono, firstName, lastName }: TeamMemberRequestBody =
    req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    await teamMemberSchema.validate(req.body, { abortEarly: false });

    const newMemberRef = await addDoc(collection(db, 'teams'), {
      email,
      numeroTelefono,
      firstName,
      lastName,
      teamLeadID: userUID, // 🔹 Aseguramos que el usuario autenticado sea el líder del equipo
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      id: newMemberRef.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al registrar usuario' });
  }
};
