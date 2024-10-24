import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, addDoc } from 'firebase/firestore'; // Importa addDoc para generar ID automáticamente

import { db } from '@/lib/firebase';
import { setCsrfCookie, validateCsrfToken } from '@/lib/csrf';
import { TeamMemberRequestBody } from '@/types';
import { teamMemberSchema } from '@/schemas/teamMemberSchema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
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
  }

  if (req.method === 'POST') {
    const isValidCsrf = validateCsrfToken(req);
    if (!isValidCsrf) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    const {
      email,
      numeroTelefono,
      firstName,
      lastName,
    }: TeamMemberRequestBody = req.body;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' });
    }

    try {
      await teamMemberSchema.validate(req.body, { abortEarly: false });

      const newMemberRef = await addDoc(collection(db, 'teams'), {
        email,
        numeroTelefono,
        firstName,
        lastName,
        teamLeadID: req.body.uid,
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
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}
