// pages/trial-expired.tsx

import { useRouter } from "next/router";

const TrialExpired = () => {
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Tu prueba gratuita ha expirado</h1>
      <p>Compra una licencia para seguir usando el servicio.</p>
      <button
        onClick={handleCheckout}
        className="bg-blue-500 text-white py-2 px-4"
      >
        Comprar Licencia
      </button>
    </div>
  );
};

export default TrialExpired;
