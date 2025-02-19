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

  const { customer_id } = req.query; // Capturar el ID del cliente desde la URL

  if (!customer_id || typeof customer_id !== 'string') {
    console.warn('⚠️ ID del cliente requerido o inválido.');
    return res.status(400).json({ error: 'Falta el ID del cliente' });
  }

  try {
    console.log('🔹 Consultando detalles del cliente:', customer_id);

    // Obtener la información del cliente desde Stripe usando el customer_id dinámico
    const customer = await stripe.customers.retrieve(customer_id);

    console.log('✅ Información del cliente obtenida correctamente.');
    return res.status(200).json({ customer });
  } catch (error: any) {
    console.error('❌ Error al obtener la información del cliente:', error);
    return res.status(500).json({
      error: 'Error al obtener la información del cliente',
      message: error.message,
    });
  }
}
