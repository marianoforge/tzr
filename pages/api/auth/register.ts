import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc, Timestamp } from 'firebase/firestore'; // Importa Timestamp
import axios from 'axios';
import admin from 'firebase-admin';

import { db } from '@/lib/firebase';
import { setCsrfCookie, validateCsrfToken } from '@/lib/csrf';
import { RegisterRequestBody } from '@/common/types/';

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

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
      currencySymbol,
      captchaToken,
      noUpdates,
    }: RegisterRequestBody = req.body;

    if (
      !email ||
      !agenciaBroker ||
      !numeroTelefono ||
      !firstName ||
      !lastName ||
      !verificationToken ||
      !currency ||
      !currencySymbol ||
      !captchaToken
    ) {
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' });
    }

    try {
      // Check if the email is already registered in Firebase Authentication
      const userRecord = await admin
        .auth()
        .getUserByEmail(email)
        .catch(() => null);

      if (userRecord) {
        return res.status(400).json({
          message:
            'El correo electrónico ya está registrado, por favor utiliza otro o sino envia un email a info@realtortrackpro.com para obtener soporte',
        });
      }

      const captchaResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            secret: RECAPTCHA_SECRET_KEY,
            response: captchaToken,
          },
        }
      );

      const {
        success,
        score,
        'error-codes': errorCodes,
      } = captchaResponse.data;

      if (!success || (score !== undefined && score < 0.5)) {
        return res.status(400).json({
          message: 'Fallo la validación del captcha',
          errors: errorCodes || [],
        });
      }

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
        currencySymbol,
        captchaToken,
        noUpdates,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000)), // Caducidad en 15 minutos
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
