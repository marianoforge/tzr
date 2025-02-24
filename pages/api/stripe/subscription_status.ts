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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscription_id } = req.query;

  if (!subscription_id || typeof subscription_id !== 'string') {
    console.warn('⚠️ ID de suscripción requerido o inválido.');
    return res.status(400).json({ error: 'Falta el ID de la suscripción' });
  }

  try {
    console.log('🔹 Consultando estado de la suscripción:', subscription_id);

    // Obtener los detalles de la suscripción desde Stripe
    const subscription = await stripe.subscriptions.retrieve(subscription_id);

    console.log('✅ Estado de la suscripción obtenido:', subscription.status);

    // Devolver el estado de la suscripción (trialing, active, etc.)
    return res.status(200).json({ status: subscription.status });
  } catch (error: any) {
    console.error('❌ Error al obtener el estado de la suscripción:', error);

    return res.status(500).json({
      error: 'Error al obtener el estado de la suscripción',
      message: error.message,
    });
  }
}
