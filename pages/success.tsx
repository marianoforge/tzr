// pages/success.tsx

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Define el tipo de datos de la sesión según lo que obtienes de Stripe
interface SessionType {
  id: string;
  amount_total: number;
  customer_email: string;
  payment_status: string;
  // Agrega más propiedades de la sesión si las necesitas
}

export default function Success() {
  const router = useRouter();
  const [session, setSession] = useState<SessionType | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionId = router.query.session_id;

      if (sessionId) {
        try {
          const res = await fetch(`/api/checkout_session/${sessionId}`);
          const data = await res.json();
          setSession(data); // Guardar los datos de la sesión
        } catch (error) {
          console.error("Error al obtener los detalles de la sesión:", error);
        }
      }
    };

    fetchSession();
  }, [router.query.session_id]);

  return (
    <div>
      <h1>¡Pago exitoso!</h1>
      {session ? (
        <div>
          <p>Detalles de tu pago:</p>
          <p>ID de la sesión: {session.id}</p>
          <p>Correo del cliente: {session.customer_email}</p>
          <p>Total pagado: ${session.amount_total / 100}</p>{" "}
          {/* Stripe maneja cantidades en centavos */}
          <p>Estado del pago: {session.payment_status}</p>
        </div>
      ) : (
        <p>Cargando detalles del pago...</p>
      )}
    </div>
  );
}
