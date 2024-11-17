import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { email } = req.body; // Asegúrate de recibir el email

    try {
      // Obtener el usuario de la base de datos
      const userDocRef = doc(db, 'usuarios', email);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { priceId } = userDoc.data();

      // Crear la sesión de pago
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      });

      res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
