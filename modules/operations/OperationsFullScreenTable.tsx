import React from 'react';

import { Operation } from '@/common/types/';
import { formatNumber } from '@/common/utils/formatNumber';
import Button from '@/components/PrivateComponente/FormComponents/Button';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation;
}

// Utility function to handle displaying 'N/A'
const displayValue = (value: string | number | null | undefined) => {
  return !value || value === 0 ? 'N/A' : value;
};

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  isOpen,
  onClose,
  operation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white pt-6 pb-10 px-12 rounded-lg w-[60%] 2xl:w-[50%]">
        <h2 className="text-2xl text-mediumBlue font-bold mb-6">
          Ficha de la Operación
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <p>
            <span className="font-semibold">Fecha:</span>{' '}
            {new Date(operation.fecha_operacion).toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold">Operación:</span>{' '}
            {displayValue(operation.direccion_reserva)}
          </p>
          <p>
            <span className="font-semibold">Número de Casa:</span>
            {displayValue(operation.numero_casa)}
          </p>
          <p>
            <span className="font-semibold">Localidad:</span>
            {displayValue(operation.localidad_reserva)}
          </p>
          <p>
            <span className="font-semibold">Provincia:</span>
            {displayValue(operation.provincia_reserva)}
          </p>
          <p>
            <span className="font-semibold">País:</span>
            {displayValue(operation.pais)}
          </p>

          <p>
            <span className="font-semibold">Tipo: </span>
            {displayValue(operation.tipo_operacion)}
          </p>
          <p>
            <span className="font-semibold">Valor Reserva / Cierre: </span> $
            {formatNumber(operation.valor_reserva)}
          </p>
          <p>
            <span className="font-semibold">Porcentaje Punta Compradora:</span>{' '}
            {operation.porcentaje_punta_compradora}%
          </p>
          <p>
            <span className="font-semibold">Porcentaje Punta Vendedora:</span>{' '}
            {operation.porcentaje_punta_vendedora}%
          </p>
          <p>
            <span className="font-semibold">Cantidad de Puntas:</span>{' '}
            {formatNumber(
              Number(operation.punta_vendedora) +
                Number(operation.punta_compradora)
            )}
          </p>
          <p>
            <span className="font-semibold">Honorarios Brutos:</span> $
            {formatNumber(operation.honorarios_broker)}
          </p>
          <p>
            <span className="font-semibold">Honorarios Netos:</span> $
            {formatNumber(operation.honorarios_asesor)}
          </p>
          <p>
            <span className="font-semibold">Porcentaje Honorarios Asesor:</span>{' '}
            {formatNumber(operation.porcentaje_honorarios_asesor)}%
          </p>
          <p>
            <span className="font-semibold">
              Porcentaje Honorarios Broker / Team Leader:{' '}
            </span>
            {formatNumber(operation.porcentaje_honorarios_broker)}%
          </p>
          <p>
            <span className="font-semibold">Sobre de Reserva: </span>{' '}
            {displayValue(operation.numero_sobre_reserva)}
          </p>
          <p>
            <span className="font-semibold">Monto Sobre de Reserva:</span>{' '}
            {formatNumber(operation.monto_sobre_reserva ?? 'N/A')}
          </p>
          <p>
            <span className="font-semibold">Sobre de Refuerzo:</span>{' '}
            {displayValue(operation.numero_sobre_refuerzo)}
          </p>
          <p>
            <span className="font-semibold">Monto Sobre de Refuerzo:</span>{' '}
            {formatNumber(operation.monto_sobre_refuerzo ?? 'N/A')}
          </p>
          <p>
            <span className="font-semibold">Referido:</span>{' '}
            {displayValue(operation.referido)}
          </p>
          <p>
            <span className="font-semibold">Porcentaje Referido:</span>{' '}
            {operation.porcentaje_referido}%
          </p>
          <p>
            <span className="font-semibold">Porcentaje Compartido:</span>{' '}
            {operation.porcentaje_compartido}%
          </p>
          <p>
            <span className="font-semibold">Compartido:</span>{' '}
            {displayValue(operation.compartido)}
          </p>
          <p>
            <span className="font-semibold">
              Asesor Realizador de la Venta:{' '}
            </span>{' '}
            {displayValue(operation.realizador_venta)}
          </p>
          <p>
            <span className="font-semibold">Asesor Adicional: </span>{' '}
            {displayValue(operation.realizador_venta_adicional)}
          </p>
          <p>
            <span className="font-semibold">Estado de la Operacion: </span>{' '}
            {displayValue(operation.estado)}
          </p>
          <p>
            <span className="font-semibold">Observaciones: </span>{' '}
            {displayValue(operation.observaciones)}
          </p>
        </div>
        <div
          className="flex justify-center items-center
        "
        >
          <Button
            type="button"
            onClick={onClose}
            className="bg-mediumBlue text-white p-2 rounded hover:bg-lightBlue transition-all duration-300 font-semibold w-48 mt-10"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FullScreenModal;
