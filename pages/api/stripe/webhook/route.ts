import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import admin from 'firebase-admin';

// Inicializa Firebase Admin si no está inicializado
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

// Inicializa Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  let event;
  const sig = req.headers.get('stripe-signature') as string;

  try {
    // Obtiene el cuerpo de la solicitud como un buffer
    const rawBody = await req.arrayBuffer();
    const buf = Buffer.from(rawBody);

    // Verifica la firma del webhook de Stripe
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error('⚠️ Error verificando el webhook:', err.message);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  // Manejar la cancelación de la suscripción
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    try {
      // Buscar usuario en Firestore por Stripe Customer ID
      const userRef = db
        .collection('ususarios')
        .where('stripeCustomerId', '==', customerId);
      const snapshot = await userRef.get();

      if (snapshot.empty) {
        console.warn(`⚠️ No se encontró usuario con Stripe ID: ${customerId}`);
        return NextResponse.json({ received: true });
      }

      // Actualizar Firestore: eliminar la suscripción
      snapshot.forEach(async (doc) => {
        await doc.ref.update({ stripeSubscriptionId: null });
      });

      console.log(
        `✅ Suscripción cancelada para el usuario con Stripe ID: ${customerId}`
      );
    } catch (error) {
      console.error('❌ Error actualizando Firestore:', error);
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
