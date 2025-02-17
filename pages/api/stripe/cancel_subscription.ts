import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
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

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // 🔹 Validar el token de Firebase para autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(token);

    const { subscription_id, user_id } = req.body;

    if (!subscription_id || typeof subscription_id !== 'string' || !user_id) {
      return res.status(400).json({ error: 'Faltan parámetros' });
    }

    // Cancelar la suscripción en Stripe
    const canceledSubscription =
      await stripe.subscriptions.cancel(subscription_id);

    // Actualizar Firestore (opcional, el webhook también lo hace)
    await db.collection('usuarios').doc(user_id).update({
      stripeSubscriptionId: null,
    });

    // Enviar notificación por email
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY as string,
    });

    const sentFrom = new Sender(
      process.env.MAILERSEND_FROM_EMAIL as string,
      process.env.MAILERSEND_FROM_NAME as string
    );

    const recipients = [
      new Recipient(process.env.NOTIFICATION_EMAIL as string, 'Admin'),
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Subscription Canceled')
      .setText(
        `The subscription with ID ${subscription_id} has been canceled.`
      );

    await mailerSend.email.send(emailParams);

    res.status(200).json({
      message: 'Suscripción cancelada',
      subscription: canceledSubscription,
    });
  } catch (error) {
    console.error('Error al cancelar la suscripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
