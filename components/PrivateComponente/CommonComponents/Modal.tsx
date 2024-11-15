import React from 'react';

import { ModalProps } from '@/common/types';

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  message,
  onAccept,
  secondButtonText,
  onSecondButtonClick,
  thirdButtonText,
  onThirdButtonClick,
  className,
}) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    onClose();
    onAccept?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white p-6 rounded-xl shadow-lg text-center font-bold w-[360px] h-[15%] flex flex-col justify-center items-center ${className}`}
      >
        <p className="text-lg mb-4">{message}</p>
        <div className="flex flex-row gap-4 w-full justify-center items-center">
          <button
            onClick={handleAccept}
            className="bg-mediumBlue text-white p-2 rounded hover:bg-lightBlue transition-all duration-300 font-bold w-full h-[40px]"
          >
            Cerrar
          </button>
          {secondButtonText && onSecondButtonClick && (
            <button
              onClick={onSecondButtonClick}
              className="bg-lightBlue text-white p-2 rounded hover:bg-mediumBlue transition-all duration-300 font-bold w-full h-[40px]"
            >
              {secondButtonText}
            </button>
          )}
          {thirdButtonText && onThirdButtonClick && (
            <button
              onClick={onThirdButtonClick}
              className="bg-redAccent text-white p-2 rounded hover:bg-mediumBlue transition-all duration-300 font-bold w-full h-[40px]"
            >
              {thirdButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
