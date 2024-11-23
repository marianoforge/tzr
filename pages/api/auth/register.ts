import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc, Timestamp } from 'firebase/firestore'; // Importa Timestamp

import { db } from '@/lib/firebase';
import { setCsrfCookie, validateCsrfToken } from '@/lib/csrf';
import { RegisterRequestBody } from '@/common/types/';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const existingToken = req.cookies['csrfToken'];
    if (!existingToken) {
      const token = setCsrfCookie(res);
      // eslint-disable-next-line no-console
      console.log('Generated CSRF token:', token);
      return res.status(200).json({ csrfToken: token });
    } else {
      // eslint-disable-next-line no-console
      console.log('CSRF token already exists:', existingToken);
      return res.status(200).json({ csrfToken: existingToken });
    }
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
      priceId,
      verificationToken,
      currency,
      region,
      currencySymbol,
    }: RegisterRequestBody = req.body;
    if (
      !email ||
      !agenciaBroker ||
      !numeroTelefono ||
      !firstName ||
      !lastName ||
      !verificationToken
    ) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' });
    }

    try {
      // Almacenar datos preliminares
      await setDoc(doc(db, 'verifications', email), {
        email,
        password,
        agenciaBroker,
        numeroTelefono,
        firstName,
        lastName,
        priceId,
        verificationToken,
        currency,
        region,
        currencySymbol,
        createdAt: Timestamp.now(),
      });

      // Devuelve el token al cliente
      return res.status(200).json({ verificationToken });
    } catch (error) {
      console.error('Error in registration process:', error);
      return res
        .status(500)
        .json({ message: 'Error en el registro preliminar' });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
