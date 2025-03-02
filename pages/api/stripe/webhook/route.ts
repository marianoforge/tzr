import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth, db } from '@/lib/firebaseAdmin'; // 🔹 Use Firebase Admin SDK

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  let event;
  const sig = req.headers.get('stripe-signature') as string;

  if (!sig) {
    console.error('❌ No Stripe signature found in request headers');
    return NextResponse.json(
      { error: 'No Stripe signature found' },
      { status: 400 }
    );
  }

  try {
    console.log('🔹 New webhook event received');
    console.log(
      '🔹 Request headers:',
      JSON.stringify(Object.fromEntries(req.headers))
    );

    // Obtain raw body of request
    const rawBody = await req.arrayBuffer();
    const buf = Buffer.from(rawBody);

    // Validate Stripe Webhook Signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log('✅ Webhook signature verified:', event.type);

    // Handle subscription deletion event
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      try {
        console.log(
          '🔹 Searching for user with Stripe Customer ID:',
          customerId
        );

        const userQuery = db
          .collection('usuarios')
          .where('stripeCustomerId', '==', customerId);
        const snapshot = await userQuery.get();

        if (snapshot.empty) {
          console.warn(
            `⚠️ No user found with Stripe Customer ID: ${customerId}`
          );
          return NextResponse.json({ received: true, status: 'no_user_found' });
        }

        await Promise.all(
          snapshot.docs.map(async (doc) => {
            await doc.ref.update({ stripeSubscriptionId: null });
            console.log(`✅ Subscription canceled for user ${doc.id}`);
          })
        );
      } catch (error) {
        console.error('❌ Error updating Firestore:', error);
        // Still return 200 to acknowledge receipt
        return NextResponse.json({
          received: true,
          status: 'error_updating_firestore',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status;

      try {
        console.log(
          '🔹 Updating subscription status for customer:',
          customerId
        );

        const userQuery = db
          .collection('usuarios')
          .where('stripeCustomerId', '==', customerId);
        const snapshot = await userQuery.get();

        if (!snapshot.empty) {
          await Promise.all(
            snapshot.docs.map(async (doc) => {
              await doc.ref.update({ stripeSubscriptionStatus: status });
              console.log(
                `✅ Updated subscription status to '${status}' for user ${doc.id}`
              );
            })
          );
        } else {
          console.warn(
            `⚠️ No user found for subscription update: ${customerId}`
          );
        }
      } catch (error) {
        console.error('❌ Error updating subscription status:', error);
        // Still return 200 to acknowledge receipt
        return NextResponse.json({
          received: true,
          status: 'error_updating_subscription',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Successfully processed the webhook event
    return NextResponse.json({
      received: true,
      status: 'success',
      type: event.type,
    });
  } catch (err: any) {
    console.error('❌ Webhook error:', {
      message: err.message,
      stack: err.stack,
      headers: JSON.stringify(Object.fromEntries(req.headers)),
    });

    return NextResponse.json(
      {
        error: 'Webhook error',
        message: err.message,
      },
      { status: 400 }
    );
  }
}
