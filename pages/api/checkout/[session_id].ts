// pages/api/checkout_session/[session_id].ts
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { session_id } = req.query; // Obtener el session_id desde la URL

  if (req.method === "GET") {
    try {
      if (!session_id || typeof session_id !== "string") {
        res.status(400).json({ error: "Session ID inválido" });
        return;
      }

      // Recuperar los detalles de la sesión de Stripe usando el session_id
      const session = await stripe.checkout.sessions.retrieve(session_id);

      // Devolver los detalles de la sesión al frontend
      res.status(200).json(session);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      res.status(500).json({ error: errorMessage });
    }
  } else {
    res.setHeader("Allow", "GET");
    res.status(405).end("Method Not Allowed");
  }
}
