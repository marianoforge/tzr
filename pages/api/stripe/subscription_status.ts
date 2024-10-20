import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { subscription_id } = req.query;

  if (!subscription_id || typeof subscription_id !== "string") {
    return res.status(400).json({ error: "Falta el ID de la suscripción" });
  }

  try {
    // Obtener los detalles de la suscripción desde Stripe
    const subscription = await stripe.subscriptions.retrieve(subscription_id);

    // Devolver el estado de la suscripción (trialing, active, etc.)
    res.status(200).json({ status: subscription.status });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener el estado de la suscripción" });
  }
}
