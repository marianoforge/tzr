import type { NextApiRequest, NextApiResponse } from 'next';
import { sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebaseAdmin';

interface ResetPasswordRequestBody {
  email: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const { email }: ResetPasswordRequestBody = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: 'El correo electrónico es requerido' });
    }

    await sendPasswordResetEmail(auth, email);
    return res.status(200).json({
      message: `Se ha enviado un enlace de restablecimiento de contraseña a ${email}.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error al enviar el correo de restablecimiento de contraseña.',
    });
  }
}
