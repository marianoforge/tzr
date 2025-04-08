import type { NextApiRequest, NextApiResponse } from 'next';
import { ValidationError } from 'yup';
import { FirebaseError } from 'firebase/app';

import { loginWithEmailAndPassword } from '@/lib/api/auth'; // Refactored authentication function
import { LoginRequestBody } from '@/common/types/';
import { schema } from '@/common/schemas/loginFormSchema'; // Validation schema

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    console.log('🔹 Nueva petición a /api/login');

    // 🔹 Validate request body with Yup schema
    await schema.validate(req.body, { abortEarly: false });

    // 🔹 Extract email and password from request
    const { email, password }: LoginRequestBody = req.body;

    if (!email || !password) {
      console.warn('⚠️ Correo electrónico y contraseña requeridos.');
      return res.status(400).json({
        message: 'El correo electrónico y la contraseña son requeridos.',
      });
    }

    console.log(`🔹 Intentando iniciar sesión con el correo: ${email}`);

    // 🔹 Attempt to login user
    const response = await loginWithEmailAndPassword(email, password);

    console.log('✅ Inicio de sesión exitoso.');
    return res
      .status(200)
      .json({ message: response.message, user: response.user });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      console.warn('⚠️ Error de validación en los campos del formulario.');
      return res.status(400).json({
        message: 'Error de validación',
        errors: error.errors, // Returns validation errors
      });
    }

    if (error instanceof FirebaseError) {
      console.error('❌ Error de Firebase:', error.code);
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-email'
      ) {
        return res.status(401).json({
          message: 'Email no registrado',
        });
      } else if (error.code === 'auth/wrong-password') {
        return res.status(401).json({
          message: 'Contraseña incorrecta',
        });
      }
    }

    console.error('❌ Error al iniciar sesión:', error);
    return res.status(401).json({
      message: 'Error al iniciar sesión, verifica tus credenciales.',
    });
  }
}
