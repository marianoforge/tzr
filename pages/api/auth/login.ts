import type { NextApiRequest, NextApiResponse } from 'next';
import { ValidationError } from 'yup'; // Import the ValidationError type

import { loginWithEmailAndPassword } from '@/lib/api/auth'; // Usamos las funciones refactorizadas
import { LoginRequestBody } from '@/common/types/';
import { schema } from '@/common/schemas/loginFormSchema'; // Importa el esquema de validación

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, password }: LoginRequestBody = req.body;

  try {
    await schema.validate(req.body, { abortEarly: false });

    // Validar si se pasó email y password
    if (!email || !password) {
      return res.status(400).json({
        message: 'El correo electrónico y la contraseña son requeridos.',
      });
    }

    const response = await loginWithEmailAndPassword(email, password);
    return res
      .status(200)
      .json({ message: response.message, user: response.user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error al iniciar sesión:', error.message);
    } else {
      console.error('Error al iniciar sesión:', error);
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: 'Error de validación',
        errors: error.errors, // Retorna los errores de validación
      });
    } else {
      return res.status(401).json({
        message: 'Error al iniciar sesión, verifica tus credenciales.',
      });
    }
  }
}
