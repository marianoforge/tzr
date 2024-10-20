import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutButton = ({ priceId }: { priceId: string }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await res.json();
      const stripe = await stripePromise;

      if (sessionId) {
        const { error } = await stripe!.redirectToCheckout({ sessionId });
        if (error) console.error("Stripe redirection error:", error);
      } else {
        console.error("No sessionId returned.");
      }
    } catch (error) {
      console.error("Error in Checkout session creation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-500 text-white py-2 px-4 rounded"
    >
      {loading ? "Cargando..." : "Comprar Licencia"}
    </button>
  );
};

export default CheckoutButton;
