import { NextApiRequest, NextApiResponse } from 'next';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  setDoc,
  Timestamp,
  doc,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Stripe from 'stripe';

import { auth, db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Realizar una consulta para encontrar el documento con el verificationToken
    const verificationsRef = collection(db, 'verifications');
    const q = query(verificationsRef, where('verificationToken', '==', token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const verificationDoc = querySnapshot.docs[0];
    const { expiresAt } = verificationDoc.data();

    if (expiresAt.toMillis() < Date.now()) {
      await deleteDoc(verificationDoc.ref); // Elimina el documento caducado
      return res.status(400).json({
        message: 'El Token ha expirado por favor regístrate de nuevo.',
      });
    }

    const {
      email,
      password,
      agenciaBroker,
      numeroTelefono,
      firstName,
      lastName,
      priceId,
      currency,
      currencySymbol,
    } = verificationDoc.data();

    // Completar el registro del usuario
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, 'usuarios', user.uid), {
      email: user.email,
      agenciaBroker,
      numeroTelefono,
      firstName,
      lastName,
      priceId,
      uid: user.uid,
      currency,
      currencySymbol,
      createdAt: Timestamp.now(),
    });

    // Crear la sesión de pago en Stripe
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

    // Eliminar el registro de verificación ya que el token ha sido usado
    await deleteDoc(verificationDoc.ref);

    res.status(200).json({
      message: 'Email verified and user registered successfully',
      sessionId: session.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        'Error al verificar el correo electrónico. Envíe un email a info@realtortrackpro.com para obtener soporte. Muchas gracias.',
    });
  }
}
