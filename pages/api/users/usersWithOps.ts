import type { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { setCsrfCookie, validateCsrfToken } from '@/lib/csrf';
import { userSchema } from '@/common/schemas/userSchema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const token = setCsrfCookie(res);

      const usuariosCollection = collection(db, 'usuarios');
      const usuariosSnapshot = await getDocs(usuariosCollection);

      const usuarios = usuariosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const usersWithOperations = await Promise.all(
        usuarios.map(async (usuario) => {
          const operationsQuery = query(
            collection(db, 'operations'),
            where('user_uid', '==', usuario.id)
          );
          const operationsSnapshot = await getDocs(operationsQuery);

          const operaciones = operationsSnapshot.docs.map((opDoc) =>
            opDoc.data()
          );
          return { ...usuario, operaciones };
        })
      );

      // Respond with users and operations
      return res.status(200).json({ csrfToken: token, usersWithOperations });
    } catch (error) {
      console.error('Error fetching data:', error);
      return res
        .status(500)
        .json({ message: 'Error fetching users and operations' });
    }
  }

  if (req.method === 'POST') {
    const isValidCsrf = validateCsrfToken(req);
    if (!isValidCsrf) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    try {
      await userSchema.validate(req.body, { abortEarly: false });

      const { uid, email, numeroTelefono, firstName, lastName } = req.body;

      // Create new user in "usuarios" collection
      const newUserRef = await addDoc(collection(db, 'usuarios'), {
        uid,
        email,
        numeroTelefono,
        firstName,
        lastName,
        createdAt: new Date(),
      });

      return res.status(201).json({
        message: 'User created successfully',
        id: newUserRef.id,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Error creating user' });
    }
  }

  // Return 405 for unsupported methods
  return res.status(405).json({ message: 'Method not allowed' });
}
