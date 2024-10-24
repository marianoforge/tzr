import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { customer_id } = req.query; // Aquí tomamos el customer_id de la query

  if (!customer_id || typeof customer_id !== 'string') {
    return res.status(400).json({ error: 'Falta el ID del cliente' });
  }

  try {
    // Obtener la información del cliente desde Stripe usando el customer_id dinámico
    const customer = await stripe.customers.retrieve(customer_id);

    res.status(200).json({ customer });
  } catch (error: unknown) {
    console.error('Error al obtener la información del cliente:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener la información del cliente' });
  }
}
