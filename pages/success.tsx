// pages/success.tsx

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/TrackerComponents/FormComponents/Button";
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
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen rounded-xl ring-1 ring-black/5 bg-gradient-to-r from-lightBlue via-mediumBlue to-darkBlue">
      <div className="flex items-center justify-center lg:justify-start">
        <Link href="/" title="Home">
          <Image
            src="/trackProLogoNoBg.png"
            alt="Logo"
            width={150}
            height={150}
            className="w-80"
          />
        </Link>
      </div>
      <div className="bg-white p-6 shadow-md w-11/12 max-w-lg rounded-lg justify-center items-center flex flex-col h-auto gap-8">
        <h1 className="text-[32px] text-greenAccent font-semibold">
          ¡Pago exitoso!
        </h1>
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
          <p className="text-lg">Cargando detalles del pago...</p>
        )}
        <div className="w-full flex justify-around">
          <Button
            onClick={() => router.push("/")}
            className="bg-mediumBlue hover:bg-lightBlue text-white p-2 rounded transition-all duration-300 font-semibold w-[200px] cursor-pointer"
            type="button"
          >
            Ir al Login{" "}
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="bg-lightBlue hover:bg-mediumBlue text-white p-2 rounded transition-all duration-300 font-semibold w-[200px] cursor-pointer"
            type="button"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
