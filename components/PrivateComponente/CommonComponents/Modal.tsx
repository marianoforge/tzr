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
  messageClassName,
  title,
}) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    onClose();
    onAccept?.();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden ${className}`}
      >
        {/* Header con icono */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">
                {title || 'Confirmar Acción'}
              </h2>
            </div>
            <button
              onClick={handleAccept}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6">
          <p
            className={`text-gray-700 text-base leading-relaxed mb-6 ${messageClassName}`}
          >
            {message}
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            {thirdButtonText && onThirdButtonClick && (
              <button
                onClick={onThirdButtonClick}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm"
              >
                {thirdButtonText}
              </button>
            )}

            {secondButtonText && onSecondButtonClick && (
              <button
                onClick={onSecondButtonClick}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
              >
                {secondButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
