import type { NextApiRequest, NextApiResponse } from 'next';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore'; // Importa Timestamp

import { auth, db } from '@/lib/firebase';
import { setCsrfCookie, validateCsrfToken } from '@/lib/csrf';
import { RegisterRequestBody } from '@/common/types/';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const token = setCsrfCookie(res);
    return res.status(200).json({ csrfToken: token });
  }

  if (req.method === 'POST') {
    const isValidCsrf = validateCsrfToken(req);
    if (!isValidCsrf) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    const {
      email,
      password,
      agenciaBroker,
      numeroTelefono,
      firstName,
      lastName,
      role,
      googleUser,
      uid,
      priceId,
      stripeCustomerId,
      stripeSubscriptionId,
    }: RegisterRequestBody = req.body;

    if (
      !email ||
      !agenciaBroker ||
      !numeroTelefono ||
      !firstName ||
      !lastName ||
      !role
    ) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' });
    }

    try {
      // Si el usuario se está registrando con Google
      if (googleUser && uid) {
        await setDoc(doc(db, 'usuarios', uid), {
          email,
          agenciaBroker,
          numeroTelefono,
          firstName,
          lastName,
          role,
          priceId,
          stripeCustomerId,
          stripeSubscriptionId,
          createdAt: Timestamp.now(), // Timestamp para createdAt
        });

        return res
          .status(201)
          .json({ message: 'Usuario registrado exitosamente (Google)' });
      }

      // Si falta la contraseña para el registro con email y contraseña
      if (!password) {
        return res.status(400).json({ message: 'La contraseña es requerida' });
      }

      // Registro con email y contraseña
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'usuarios', user.uid), {
        email: user.email,
        agenciaBroker,
        numeroTelefono,
        firstName,
        lastName,
        role,
        priceId,
        uid: user.uid,
        createdAt: Timestamp.now(), // Timestamp para createdAt
      });

      return res
        .status(201)
        .json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: error.message.includes('email-already-in-use')
            ? 'El email ya está registrado'
            : 'Error en el registro',
        });
      } else {
        return res.status(500).json({
          message: 'Error desconocido en el registro',
        });
      }
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
