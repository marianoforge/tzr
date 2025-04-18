import React from 'react';

import { Operation, UserData } from '@/common/types/';
import { formatOperationsNumber } from '@/common/utils/formatNumber';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import { calculateNetFees } from '@/common/utils/calculateNetFees';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation;
  userData: UserData;
  currencySymbol: string;
}

// Utility function to handle displaying 'N/A'
export const displayValue = (value: string | number | null | undefined) => {
  return !value || value === 0 ? 'N/A' : value;
};

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  isOpen,
  onClose,
  operation,
  userData,
  currencySymbol,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white pt-6 px-12 rounded-lg w-[60%] 2xl:w-[50%] max-h-[90vh] flex flex-col">
        <h2 className="text-2xl text-mediumBlue font-bold mb-6">
          Ficha de la Operación
        </h2>
        <div className="grid grid-cols-2 gap-6 overflow-y-auto pb-6">
          <p>
            <span className="font-semibold">
              Fecha de Captación / Publicación:
            </span>{' '}
            {operation.fecha_captacion
              ? new Date(operation.fecha_captacion).toLocaleDateString()
              : 'N/A'}
          </p>

          <p>
            <span className="font-semibold">Fecha de Reserva:</span>{' '}
            {operation.fecha_reserva
              ? new Date(operation.fecha_reserva).toLocaleDateString()
              : 'N/A'}
          </p>

          <p>
            <span className="font-semibold">Fecha de Cierre:</span>{' '}
            {new Date(operation.fecha_operacion).toLocaleDateString()}
          </p>

          <p>
            <span className="font-semibold">Dirección:</span>{' '}
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
            <span className="font-semibold">Tipo de Inmueble: </span>
            {displayValue(operation.tipo_inmueble)}
          </p>
          <p>
            <span className="font-semibold">Valor Reserva / Cierre: </span>
            {`${currencySymbol}${formatOperationsNumber(operation.valor_reserva)}`}
          </p>
          <p>
            <span className="font-semibold">Porcentaje Punta Compradora:</span>{' '}
            {typeof operation.porcentaje_punta_compradora === 'number'
              ? formatOperationsNumber(
                  operation.porcentaje_punta_compradora,
                  true
                )
              : 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Porcentaje Punta Vendedora:</span>{' '}
            {typeof operation.porcentaje_punta_vendedora === 'number'
              ? formatOperationsNumber(
                  operation.porcentaje_punta_vendedora,
                  true
                )
              : 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Cantidad de Puntas:</span>{' '}
            {formatOperationsNumber(
              Number(operation.punta_vendedora) +
                Number(operation.punta_compradora)
            )}
          </p>
          <p>
            <span className="font-semibold">Honorarios Brutos:</span>
            {`${currencySymbol}${formatOperationsNumber(operation.honorarios_broker)}`}
          </p>
          <p>
            <span className="font-semibold">Honorarios Netos:</span>
            {`${currencySymbol}${formatOperationsNumber(calculateNetFees(operation, userData))}`}
          </p>
          <p>
            <span className="font-semibold">Porcentaje Honorarios Asesor:</span>{' '}
            {typeof operation.porcentaje_honorarios_asesor === 'number'
              ? formatOperationsNumber(
                  operation.porcentaje_honorarios_asesor,
                  true
                )
              : 'N/A'}
          </p>
          <p>
            <span className="font-semibold">
              Porcentaje Honorarios Broker / Team Leader:{' '}
            </span>
            {typeof operation.porcentaje_honorarios_broker === 'number'
              ? formatOperationsNumber(
                  operation.porcentaje_honorarios_broker,
                  true
                )
              : 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Tipo de reserva: </span>{' '}
            {displayValue(operation.numero_sobre_reserva)}
          </p>
          <p>
            <span className="font-semibold">Monto de Reserva:</span>{' '}
            {operation.monto_sobre_reserva
              ? formatOperationsNumber(operation.monto_sobre_reserva)
              : 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Tipo de refuerzo: </span>{' '}
            {displayValue(operation.numero_sobre_refuerzo)}
          </p>
          <p>
            <span className="font-semibold">Monto de refuerzo:</span>{' '}
            {operation.monto_sobre_refuerzo
              ? formatOperationsNumber(operation.monto_sobre_refuerzo)
              : 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Referido:</span>{' '}
            {displayValue(operation.referido)}
          </p>
          <p>
            <span className="font-semibold">Porcentaje Referido:</span>{' '}
            {typeof operation.porcentaje_referido === 'number'
              ? formatOperationsNumber(operation.porcentaje_referido, true)
              : 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Porcentaje Compartido:</span>{' '}
            {typeof operation.porcentaje_compartido === 'number'
              ? formatOperationsNumber(operation.porcentaje_compartido, true)
              : 'N/A'}
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
            <span className="font-semibold">Exclusividad: </span>{' '}
            {displayValue(
              !operation.exclusiva ? 'N/A' : operation.exclusiva ? 'Si' : 'No'
            )}
          </p>
          <p>
            <span className="font-semibold">
              Reparticion Honorarios Asesor / Martillero / Otros:{' '}
            </span>{' '}
            {typeof operation.reparticion_honorarios_asesor === 'number'
              ? formatOperationsNumber(
                  operation.reparticion_honorarios_asesor,
                  true
                )
              : 'N/A'}
          </p>
          <p>
            <span className="font-semibold">
              Porcentaje Destinado a Franquicia / Broker:{' '}
            </span>{' '}
            {typeof operation.isFranchiseOrBroker === 'number'
              ? formatOperationsNumber(operation.isFranchiseOrBroker, true)
              : 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Observaciones: </span>{' '}
            {displayValue(operation.observaciones)}
          </p>
        </div>
        <div className="flex justify-center items-center py-4">
          <Button
            type="button"
            onClick={onClose}
            className="bg-mediumBlue text-white p-2 rounded hover:bg-lightBlue transition-all duration-300 font-semibold w-48"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FullScreenModal;
