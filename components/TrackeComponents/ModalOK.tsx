import { ModalProps } from "@/types";
import React from "react";

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  message,
  onAccept,
}) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    onClose();
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center font-bold w-[50%] h-[15%] flex flex-col justify-center items-center">
        <p className="text-lg mb-4">{message}</p>
        <button
          onClick={handleAccept}
          className="bg-[#7ED994] text-white p-2 rounded hover:bg-[#7ED994]/80 transition-all duration-300 font-bold w-full"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Modal;
