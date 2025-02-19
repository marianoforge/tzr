import type { NextApiRequest, NextApiResponse } from 'next';
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    console.warn('⚠️ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }

  try {
    console.log('🔹 Nueva petición a /api/verify-email');

    // 🔹 Validar el token en la URL
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      console.warn('⚠️ Token de verificación inválido o no proporcionado.');
      return res.status(400).json({ message: 'Token is required' });
    }

    console.log('🔹 Verificando token:', token);

    // 🔹 Buscar el token en Firestore
    const verificationsRef = collection(db, 'verifications');
    const q = query(verificationsRef, where('verificationToken', '==', token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn('⚠️ Token inválido o expirado.');
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const verificationDoc = querySnapshot.docs[0];
    const verificationData = verificationDoc.data();
    const { expiresAt } = verificationData;

    // 🔹 Verificar si el token ha expirado
    if (expiresAt.toMillis() < Date.now()) {
      console.warn('⚠️ Token expirado. Eliminando del sistema.');
      await deleteDoc(verificationDoc.ref);
      return res
        .status(400)
        .json({ message: 'El Token ha expirado, regístrese de nuevo.' });
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
      noUpdates,
    } = verificationData;

    console.log(`🔹 Registrando usuario: ${email}`);

    // 🔹 Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 🔹 Guardar usuario en Firestore
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
      noUpdates,
      createdAt: Timestamp.now(),
    });

    console.log(`✅ Usuario registrado en Firestore: ${user.uid}`);

    // 🔹 Crear la sesión de pago en Stripe
    console.log(
      `🔹 Creando sesión de Stripe para ${email} con precio ${priceId}`
    );
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
      },
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/login?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    console.log('✅ Sesión de pago creada con éxito.');

    // 🔹 Eliminar el registro de verificación ya que el token ha sido usado
    await deleteDoc(verificationDoc.ref);
    console.log('✅ Token de verificación eliminado de Firestore.');

    return res.status(200).json({
      message: 'Email verified and user registered successfully',
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('❌ Error en la verificación de email:', error);
    return res.status(500).json({
      message:
        'Error al verificar el correo electrónico. Envíe un email a info@realtortrackpro.com para obtener soporte. Muchas gracias.',
      error: error.message,
    });
  }
}
