import type { NextApiRequest, NextApiResponse } from 'next';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface ResetPasswordRequestBody {
  email: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    console.log('🔹 Nueva petición a /api/reset-password');

    // 🔹 Validar que el email está presente en la solicitud
    const { email }: ResetPasswordRequestBody = req.body;
    if (!email || typeof email !== 'string') {
      console.warn('⚠️ El correo electrónico es requerido.');
      return res
        .status(400)
        .json({ message: 'El correo electrónico es requerido' });
    }

    console.log(
      `🔹 Enviando enlace de restablecimiento de contraseña a: ${email}`
    );

    // 🔹 Enviar email de restablecimiento de contraseña
    await sendPasswordResetEmail(auth, email);

    console.log(
      '✅ Enlace de restablecimiento de contraseña enviado con éxito.'
    );
    return res.status(200).json({
      message: `Se ha enviado un enlace de restablecimiento de contraseña a ${email}.`,
    });
  } catch (error: any) {
    console.error(
      '❌ Error enviando correo de restablecimiento de contraseña:',
      error
    );

    let errorMessage =
      'Error al enviar el correo de restablecimiento de contraseña.';

    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No existe una cuenta con ese correo electrónico.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'El correo electrónico proporcionado no es válido.';
    }

    return res.status(500).json({ message: errorMessage });
  }
}
