// CardsSection.tsx
import { useRouter } from 'next/router';
import LicenseCard from './LicensesCard';

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
    <div
      className="absolute text-[#2d3748] flex flex-col justify-around items-center gap-20 pb-10 mt-20 lg:flex-row"
      style={{ top: '100%', transform: 'translateY(-30%)' }}
    >
      <LicenseCard
        title="ASESOR"
        description="Lo que necesitás para empezar."
        price="$9.99"
        annualPrice="$99.99"
        buttonText="Empieza Gratis"
        priceId={PRICE_ID_STARTER}
        features={[
          'Acceso completo a funcionalidades esenciales de RealtorTrackPro.',
          'Dashboard de seguimiento de honorarios, operaciones y gastos.',
          'Análisis de rentabilitad.',
          'Cuadros de Operaciones dinamicos e interactivos.',
          'Programacion de eventos y calendario de actividades.',
          'Ideal para la gestión de ingresos, análisis de inversiones y gastos.',
        ]}
        onSelect={handleLicenseSelect}
      />

      <LicenseCard
        title="TEAM LEADER"
        description="All the extras for your growing team."
        price="$12.99"
        annualPrice="$129.99"
        buttonText="Empieza Gratis"
        priceId={PRICE_ID_GROWTH}
        features={[
          'Incluye todas las características de la Licencia Asesor.',
          'Modulo adicional para analisis de rentabilidad e ingresos del equipo de asesores.',
          'Cuadros dinamicos e interactivos para el seguimiento de operaciones de miembros del equipo.',
          'Perfecta para líderes de equipo y gerentes de agencias inmobiliarias.',
        ]}
        onSelect={handleLicenseSelect}
      />

      <LicenseCard
        title="ENTERPRISE"
        description="Added flexibility to close deals at scale."
        price="Contáctanos"
        buttonText="Contáctanos"
        priceId={PRICE_ID_ENTERPRISE}
        features={[
          'Orientada a agencias con necesidades personalizadas.',
          'Opción de desarrollar add-ons únicos adaptados a procesos específicos.',
          'Expande las capacidades de las licencias Asesor y Team Leader.',
          'Cotización independiente según el proyecto.',
        ]}
        onSelect={handleLicenseSelect}
      />
    </div>
  );
};

export default LicensesSection;
