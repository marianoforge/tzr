import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-lg mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-[#7ED994] text-white p-2 rounded hover:bg-[#7ED994]/80 transition-all duration-300 font-bold"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Modal;
