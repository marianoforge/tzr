import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { adminAuth } from '@/lib/firebaseAdmin'; // 🔹 Usa Firebase Admin SDK

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscription_id } = req.query;

  try {
    console.log('🔹 Nueva petición a /api/subscription_details');

    // 🔹 Validar el token de Firebase para autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No se proporcionó token en la cabecera.');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log('✅ Token verificado para UID:', decodedToken.uid);

    if (!subscription_id || typeof subscription_id !== 'string') {
      console.warn('⚠️ ID de suscripción requerido o inválido.');
      return res.status(400).json({ error: 'Falta el ID de la suscripción' });
    }

    console.log('🔹 Consultando detalles de la suscripción:', subscription_id);

    // Obtener los detalles completos de la suscripción desde Stripe
    const subscription = await stripe.subscriptions.retrieve(subscription_id);

    console.log('✅ Detalles de la suscripción obtenidos.');
    return res.status(200).json(subscription);
  } catch (error: any) {
    console.error(
      '❌ Error al obtener la información de la suscripción:',
      error
    );
    return res.status(500).json({
      error: 'Error al obtener la información de la suscripción',
      message: error.message,
    });
  }
}
