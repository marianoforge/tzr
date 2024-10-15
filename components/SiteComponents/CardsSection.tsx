// CardsSection.tsx
import { useRouter } from "next/router";

const CardsSection = () => {
  const router = useRouter();

  const PRICE_ID_BASIC = "price_1QAASbJkIrtwQiz3PcJiJebj"; // Cambia este ID por el tuyo
  const PRICE_ID_PRO = "price_1QAAT6JkIrtwQiz3J0HLDRTQ"; // Cambia este ID por el tuyo

  const handleLicenseSelect = (priceId: string) => {
    router.push({
      pathname: "/register",
      query: { priceId }, // Pasamos el Price ID en la query
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="p-4 border">
        <h2>Licencia Básica</h2>
        <p>Descripción de la licencia básica</p>
        <button
          onClick={() => handleLicenseSelect(PRICE_ID_BASIC)}
          className="bg-blue-500 text-white py-2 px-4"
        >
          Seleccionar Licencia Básica
        </button>
      </div>

      <div className="p-4 border">
        <h2>Licencia Pro</h2>
        <p>Descripción de la licencia Pro</p>
        <button
          onClick={() => handleLicenseSelect(PRICE_ID_PRO)}
          className="bg-blue-500 text-white py-2 px-4"
        >
          Seleccionar Licencia Pro
        </button>
      </div>
    </div>
  );
};

export default CardsSection;
