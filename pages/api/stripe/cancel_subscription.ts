import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { subscription_id } = req.body;

  if (!subscription_id || typeof subscription_id !== "string") {
    return res.status(400).json({ error: "Falta el ID de la suscripción" });
  }

  try {
    // Cancelar la suscripción usando Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(
      subscription_id
    );

    res.status(200).json({
      message: "Suscripción cancelada",
      subscription: canceledSubscription,
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Error al cancelar la suscripción:", error.message);
      res.status(400).json({ error: "Error al cancelar la suscripción" });
    } else {
      console.error("Error inesperado:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
