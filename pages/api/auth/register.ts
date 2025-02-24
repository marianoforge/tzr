import type { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
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
    console.log('🔹 Nueva petición a /api/register (GET)');

    // Verificar si ya existe un token CSRF en las cookies
    const existingToken = req.cookies['csrfToken'];
    if (!existingToken) {
      const token = setCsrfCookie(res);
      console.log('✅ CSRF token generado:', token);
      return res.status(200).json({ csrfToken: token });
    } else {
      console.log('✅ CSRF token existente:', existingToken);
      return res.status(200).json({ csrfToken: existingToken });
    }
  }

  if (req.method === 'POST') {
    console.log('🔹 Nueva petición a /api/register (POST)');

    // 🔹 Validar el token CSRF
    if (!validateCsrfToken(req)) {
      console.warn('⚠️ Token CSRF inválido.');
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    // 🔹 Extraer datos del cuerpo de la solicitud
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

    // 🔹 Validar datos obligatorios
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
      console.warn('⚠️ Faltan campos obligatorios.');
      return res
        .status(400)
        .json({ message: 'Todos los campos son requeridos' });
    }

    try {
      console.log(`🔹 Verificando si el email ya está registrado: ${email}`);

      // 🔹 Verificar si el usuario ya está registrado en Firebase Auth
      const userRecord = await admin
        .auth()
        .getUserByEmail(email)
        .catch(() => null);

      if (userRecord) {
        console.warn('⚠️ El email ya está registrado.');
        return res.status(400).json({
          message:
            'El correo electrónico ya está registrado, por favor utiliza otro o envía un email a info@realtortrackpro.com para obtener soporte',
        });
      }

      // 🔹 Validar reCAPTCHA
      console.log('🔹 Validando reCAPTCHA...');
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
        console.warn('⚠️ Falló la validación del captcha:', errorCodes);
        return res.status(400).json({
          message: 'Fallo la validación del captcha',
          errors: errorCodes || [],
        });
      }

      // 🔹 Almacenar los datos preliminares en Firestore
      console.log('🔹 Guardando usuario temporal en Firestore...');
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
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 720 * 60 * 1000)), // 12 horas
      });

      console.log('✅ Registro preliminar exitoso.');
      return res.status(200).json({ verificationToken });
    } catch (error: any) {
      console.error('❌ Error en el registro preliminar:', error);
      return res
        .status(500)
        .json({
          message: 'Error en el registro preliminar',
          error: error.message,
        });
    }
  }

  console.warn('⚠️ Método no permitido:', req.method);
  return res.status(405).json({ message: 'Método no permitido' });
}
