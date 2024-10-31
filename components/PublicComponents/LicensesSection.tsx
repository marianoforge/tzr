// CardsSection.tsx
import { useRouter } from 'next/router';

interface LicensesSectionProps {
  onClose?: () => void;
}

const LicensesSection: React.FC<LicensesSectionProps> = ({ onClose }) => {
  const router = useRouter();

  const PRICE_ID_STARTER = 'price_1QAASbJkIrtwQiz3PcJiJebj';
  const PRICE_ID_GROWTH = 'price_1QAAT6JkIrtwQiz3J0HLDRTQ';
  const PRICE_ID_ENTERPRISE = 'price_1QAAT6JkIrtwQiz3J0HLDRTQ';

  const handleLicenseSelect = (priceId: string) => {
    // Almacena el priceId en el almacenamiento local
    localStorage.setItem('selectedPriceId', priceId);

    // Check if the current path is not '/register' before redirecting
    if (router.pathname !== '/register') {
      router.push('/register');
    }
    // Close the modal
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col justify-around items-center gap-20 pb-10 mt-20 lg:flex-row">
      <div className="bg-white  p-6 border rounded-lg shadow-xl lg:min-w-[360px]">
        <h2 className="text-lg font-semibold">ASESOR</h2>
        <p>Todo lo que necesitás para empezar a vender.</p>
        <p className="text-2xl font-bold mt-4">$9.99 USD por mes</p>
        <button
          onClick={() => handleLicenseSelect(PRICE_ID_STARTER)}
          className="bg-mediumBlue text-white py-2 px-4 mt-4"
        >
          Empieza Gratis
        </button>
        <ul className="mt-4">
          <li>
            Acceso completo a funcionalidades esenciales de RealtorTrackPro.
          </li>
          <li>Dashboard de seguimiento de honorarios, operaciones y gastos.</li>
          <li>Análisis de rentabilitad.</li>
          <li>Cuadros de Operaciones dinamicos e interactivos.</li>
          <li>Programacion de eventos y calendario de actividades.</li>
          <li>
            Ideal para la gestión de ingresos, análisis de inversiones y gastos.
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 border rounded-lg shadow-xl lg:min-w-[360px]">
        <h2 className="text-lg font-semibold">TEAM LEADER</h2>
        <p>All the extras for your growing team.</p>
        <p className="text-2xl font-bold mt-4">$12.99 USD por mes</p>
        <button
          onClick={() => handleLicenseSelect(PRICE_ID_GROWTH)}
          className="bg-lightBlue text-white py-2 px-4 mt-4"
        >
          Empieza Gratis
        </button>
        <ul className="mt-4">
          <li>Incluye todas las características de la Licencia Asesor.</li>
          <li>
            Modulo adicional para analisis de rentabilidad e ingresos del equipo
            de asesores.
          </li>
          <li>
            Cuadros dinamicos e interactivos para el seguimiento de operaciones
            de miembros del equipo.
          </li>
          <li>
            Perfecta para líderes de equipo y gerentes de agencias
            inmobiliarias.
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 border rounded-lg shadow-xl lg:min-w-[360px]">
        <h2 className="text-lg font-semibold">AD HOC</h2>
        <p>Added flexibility to close deals at scale.</p>
        <p className="text-2xl font-bold mt-4">Contáctanos</p>
        <button
          onClick={() => handleLicenseSelect(PRICE_ID_ENTERPRISE)}
          className="bg-mediumBlue text-white py-2 px-4 mt-4"
        >
          Contáctanos
        </button>
        <ul className="mt-4">
          <li>Orientada a agencias con necesidades personalizadas.</li>
          <li>
            Opción de desarrollar add-ons únicos adaptados a procesos
            específicos.
          </li>
          <li>
            Expande las capacidades de las licencias Asesor y Team Leader.
          </li>
          <li>Cotización independiente según el proyecto.</li>
        </ul>
      </div>
    </div>
  );
};

export default LicensesSection;
