import React from 'react';
import router from 'next/router';

import LicenseCard from './LicensesCard';

import {
  PRICE_ID_STARTER,
  PRICE_ID_GROWTH,
  PRICE_ID_ENTERPRISE,
} from '@/lib/data';

interface LicensesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LicensesModal: React.FC<LicensesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center font-bold w-auto h-auto flex flex-col justify-center items-center">
        <h1 className="text-lg mt-6 mb-10 text-mediumBlue uppercase">
          Por favor elije una opción para registrarte
        </h1>
        <div className="flex gap-12">
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
            description="Todo lo que necesitas para liderar tu equipo."
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
            description="Flexibilidad para cerrar operaciones a gran escala."
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
        <button
          onClick={onClose}
          className="bg-mediumBlue text-white p-2 rounded hover:bg-lightBlue transition-all duration-300 font-bold w-[200px] mb-6 mt-8"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default LicensesModal;
