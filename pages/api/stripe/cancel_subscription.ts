import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { adminAuth, db } from '@/lib/firebaseAdmin'; // 🔹 Use Firebase Admin SDK

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    console.warn('⚠️ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔹 New request to /api/cancel_subscription');

    // 🔹 Validate Firebase authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No token provided.');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log('✅ Token verified for UID:', decodedToken.uid);

    const { subscription_id, user_id } = req.body;

    // 🔹 Validate required parameters
    if (!subscription_id || typeof subscription_id !== 'string' || !user_id) {
      console.warn('⚠️ Missing parameters: subscription_id or user_id.');
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('🔹 Canceling subscription:', subscription_id);

    // 🔹 Cancel the subscription in Stripe
    const canceledSubscription =
      await stripe.subscriptions.cancel(subscription_id);
    console.log('✅ Subscription canceled:', canceledSubscription.id);

    // 🔹 Update Firestore (optional, Stripe webhook should handle this too)
    await db.collection('usuarios').doc(user_id).update({
      stripeSubscriptionId: null,
    });

    console.log(
      '✅ Firestore updated: stripeSubscriptionId removed for user:',
      user_id
    );

    // 🔹 Send notification email
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
    console.log('✅ Notification email sent to admin.');

    return res.status(200).json({
      message: 'Subscription successfully canceled',
      subscription: canceledSubscription,
    });
  } catch (error: any) {
    console.error('❌ Error canceling subscription:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
