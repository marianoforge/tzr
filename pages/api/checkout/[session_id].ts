import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    console.warn('⚠️ Método no permitido:', req.method);
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('🔹 Nueva petición a /api/session/[session_id]');

    // 🔹 Validar el session_id de la URL
    const { session_id } = req.query;
    if (!session_id || typeof session_id !== 'string') {
      console.warn('⚠️ ID de sesión inválido o no proporcionado.');
      return res.status(400).json({ error: 'Invalid or missing session ID' });
    }

    console.log(`🔹 Recuperando sesión de Stripe: ${session_id}`);

    // 🔹 Obtener detalles de la sesión desde Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log('✅ Sesión obtenida correctamente.');
    return res.status(200).json(session);
  } catch (error: any) {
    console.error('❌ Error al recuperar la sesión de Stripe:', error);
    return res.status(500).json({
      error: 'Error retrieving session from Stripe',
      message: error.message,
    });
  }
}
