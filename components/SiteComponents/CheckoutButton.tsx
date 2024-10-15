// components/CheckoutButton.tsx
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
      // Llamar a tu API para crear la sesión de Stripe Checkout
      const res = await fetch("/api/checkout/checkout_session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId, // Pasar el Price ID de Stripe al backend
        }),
      });

      const { id } = await res.json();

      const stripe = await stripePromise;

      // Redirigir al usuario a la página de pago de Stripe
      const { error } = await stripe!.redirectToCheckout({
        sessionId: id, // Usamos el ID de la sesión de Stripe
      });

      if (error) {
        console.error("Error en la redirección a Stripe:", error);
      }
    } catch (error) {
      console.error("Error creando sesión de Checkout:", error);
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
