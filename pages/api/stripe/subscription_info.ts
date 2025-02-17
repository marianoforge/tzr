import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import admin from 'firebase-admin';

// Inicializa Firebase si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { subscription_id } = req.query;

  try {
    // 🔹 Validar el token de Firebase para autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(token);

    if (!subscription_id || typeof subscription_id !== 'string') {
      return res.status(400).json({ error: 'Falta el ID de la suscripción' });
    }

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
