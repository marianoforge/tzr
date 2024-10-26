import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { subscription_id } = req.query;

  if (!subscription_id || typeof subscription_id !== 'string') {
    return res.status(400).json({ error: 'Falta el ID de la suscripción' });
  }

  try {
    // Obtener los detalles completos de la suscripción desde Stripe
    const subscription = await stripe.subscriptions.retrieve(subscription_id);

    // Devolver la información completa de la suscripción
    res.status(200).json(subscription);
  } catch (error: unknown) {
    console.error('Error al obtener la información de la suscripción:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener la información de la suscripción' });
  }
}
