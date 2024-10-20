import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/TrackerComponents/FormComponents/Button";
import { formatDateTime } from "@/utils/formatEventDateTime";

interface SessionType {
  id: string;
  amount_total: number;
  payment_status: string;
  subscription: string; // Para almacenar el ID de la suscripción
  customer_details: {
    email: string;
  };
}

export default function Success() {
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const sessionId = router.query.session_id;

      if (sessionId) {
        try {
          // 1. Obtener los detalles de la sesión de Stripe usando el session_id
          const res = await fetch(`/api/checkout/${sessionId}`);
          const data: SessionType = await res.json();

          // 2. Verificar el estado de la suscripción si existe
          if (data.subscription) {
            const subscriptionRes = await fetch(
              `/api/stripe/subscription_status?subscription_id=${data.subscription}`
            );
            const { status } = await subscriptionRes.json();
            console.log("Estado de la suscripción:", status);
          }
        } catch (error) {
          console.error(
            "Error al obtener los detalles de la sesión o suscripción:",
            error
          );
        }
      }
    };

    fetchSession();
  }, [router.query.session_id]);

  const timestamp = 1729450553;
  const sevenDaysInSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
  const newTimestamp = timestamp + sevenDaysInSeconds;
  const date = new Date(newTimestamp * 1000); // Convertir segundos a milisegundos
  const formattedDate = formatDateTime(date);

  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen rounded-xl ring-1 ring-black/5 bg-gradient-to-r from-lightBlue via-mediumBlue to-darkBlue">
      <div className="flex items-center justify-center lg:justify-start">
        <Link href="/" title="Home">
          <Image
            src="/trackproLogoWhite.png"
            alt="Logo"
            width={350}
            height={350}
          />
        </Link>
      </div>

      <div className="bg-white p-6 text-lg shadow-md w-11/12 max-w-lg rounded-lg justify-center items-center flex flex-col h-auto gap-2">
        <div className="px-[20px] mb-4 space-y-1">
          <div className="text-lg text-greenAccent font-semibold text-center mb-3">
            <h2>¡Muchas Gracias!</h2>
            <h1>La transacción se ha realizado con éxito</h1>
          </div>
          <p>
            Fin de la prueba gratis:{" "}
            <span className="font-semibold">{formattedDate}</span>
          </p>
        </div>

        <div className="w-full flex justify-around">
          <Button
            onClick={() => router.push("/login")}
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
