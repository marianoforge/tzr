import React from "react";
import LicensesSection from "./LicensesSection";

interface LicensesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LicensesModal: React.FC<LicensesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center font-bold w-auto h-auto flex flex-col justify-center items-center">
        <h1 className="text-lg mb-6 text-mediumBlue uppercase">
          Por favor elije una opción para registrarte
        </h1>
        <LicensesSection />
        <button
          onClick={onClose}
          className="bg-mediumBlue text-white p-2 rounded hover:bg-lightBlue transition-all duration-300 font-bold w-[200px] mt-4"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default LicensesModal;
