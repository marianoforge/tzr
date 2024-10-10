// pages/checkout.tsx

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    const res = await fetch("/api/checkout/checkout_session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId: "price_1Q88m6JkIrtwQiz39HYmPXpW",
      }),
    });

    const { id } = await res.json();

    const stripe = await stripePromise;
    if (stripe) {
      stripe.redirectToCheckout({ sessionId: id });
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Comprar Licencia</h1>
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? "Procesando..." : "Comprar Ahora"}
      </button>
    </div>
  );
}
