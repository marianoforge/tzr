import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassPlusIcon,
  EllipsisHorizontalIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';

import { Operation, UserData } from '@/common/types/';
import { formatDate } from '@/common/utils/formatDate';
import { formatNumber } from '@/common/utils/formatNumber';
import { calculateNetFees } from '@/common/utils/calculateNetFees';

interface OperationTotal {
  valor_reserva?: number;
  promedio_punta_compradora_porcentaje?: number;
  promedio_punta_vendedora_porcentaje?: number;
  promedio_suma_puntas?: number;
  suma_total_de_puntas?: number;
  honorarios_broker?: number;
  honorarios_asesor?: number;
}

interface OperationsTableBodyProps {
  currentOperations: Operation[];
  userData: UserData;
  handleEstadoChange: (id: string, currentEstado: string) => void;
  handleEditClick: (operation: Operation) => void;
  handleDeleteButtonClick: (operation: Operation) => void;
  handleViewClick: (operation: Operation) => void;
  filteredTotals: OperationTotal;
  currencySymbol: string;
  totalNetFees: number;
}

const OperationsTableBody: React.FC<OperationsTableBodyProps> = ({
  currentOperations,
  userData,
  handleEstadoChange,
  handleEditClick,
  handleDeleteButtonClick,
  handleViewClick,
  filteredTotals,
  currencySymbol,
  totalNetFees,
}) => {
  return (
    <tbody>
      {currentOperations?.map((operacion: Operation, index: number) => (
        <tr
          key={operacion.id}
          className={`${
            index % 2 === 0 ? 'bg-white' : 'bg-mediumBlue/10'
          } hover:bg-lightBlue/10 border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out text-center h-[75px] max-h-[75px]`}
        >
          <td className="py-3 px-2 before:content-['Fecha:'] md:before:content-none">
            {operacion.fecha_operacion
              ? formatDate(operacion.fecha_operacion)
              : 'N/A'}
          </td>
          <td className="py-3 px-2 before:content-['Fecha de Reserva:'] md:before:content-none">
            {operacion.fecha_reserva
              ? formatDate(operacion.fecha_reserva)
              : 'N/A'}
          </td>
          <td className="py-3 px-2 text-sm before:content-['Dirección:'] md:before:content-none">
            {(
              operacion.direccion_reserva +
              'Piso / Apto: ' +
              operacion.numero_casa
            ).slice(0, 22)}
            <EllipsisHorizontalIcon
              className="inline-block ml-1 text-lightBlue h-4 w-4 cursor-pointer"
              data-tooltip-id="tooltip-direccion"
              data-tooltip-content={
                operacion.direccion_reserva +
                ', ' +
                'Piso / Apto: ' +
                operacion.numero_casa
              }
            />
            <Tooltip id="tooltip-direccion" place="top" />
          </td>
          <td className="py-3 px-2 before:content-['Tipo:'] md:before:content-none">
            {operacion.tipo_operacion}
          </td>
          <td className="py-3 px-2 before:content-['Valor:'] md:before:content-none">
            {`${currencySymbol}${formatNumber(operacion.valor_reserva)}`}
          </td>
          <td className="py-3 px-2 before:content-['Punta Vendedora:'] md:before:content-none">
            {formatNumber(operacion.porcentaje_punta_vendedora ?? 0)}%
          </td>
          <td className="py-3 px-2 before:content-['Punta Compradora:'] md:before:content-none">
            {formatNumber(operacion.porcentaje_punta_compradora ?? 0)}%
          </td>
          <td className="py-3 px-2 before:content-['Punta Vendedora:'] md:before:content-none">
            {formatNumber(
              operacion.porcentaje_punta_compradora +
                operacion.porcentaje_punta_vendedora
            )}
            %
          </td>
          <td className="py-3 px-2 before:content-['Puntas:'] md:before:content-none">
            {formatNumber(
              Number(operacion.punta_compradora) +
                Number(operacion.punta_vendedora)
            )}
          </td>
          <td className="py-3 px-2 before:content-['Honorarios Agencia:'] md:before:content-none">
            {`${currencySymbol}${formatNumber(operacion.honorarios_broker)}`}
          </td>
          <td className="py-3 px-2 before:content-['Honorarios Netos:'] md:before:content-none">
            {`${currencySymbol}${formatNumber(calculateNetFees(operacion, userData))}`}
          </td>
          <td className="py-3 px-2 md:before:content-none">
            <button
              onClick={() => handleEstadoChange(operacion.id, operacion.estado)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition duration-150 ease-in-out ${
                operacion.estado === 'En Curso'
                  ? `bg-mediumBlue`
                  : `bg-lightBlue`
              }`}
            >
              <span
                className={`${
                  operacion.estado === 'En Curso'
                    ? 'translate-x-6'
                    : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition duration-150 ease-in-out`}
              >
                {operacion.estado === 'En Curso' ? (
                  <p className="h-4 w-4 text-mediumBlue flex justify-center items-center">
                    A
                  </p>
                ) : (
                  <p className="h-4 w-4 text-lightBlue flex justify-center items-center">
                    C
                  </p>
                )}
              </span>
            </button>
          </td>
          <td className="md:before:content-none">
            <button
              onClick={() => handleEditClick(operacion)}
              className="text-darkBlue hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          </td>
          <td className="md:before:content-none">
            <button
              onClick={() => handleDeleteButtonClick(operacion)}
              className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
            >
              <TrashIcon className="text-redAccent h-5 w-5" />
            </button>
          </td>
          <td className="md:before:content-none text-mediumBlue text-sm font-semibold pr-2">
            <button
              onClick={() => handleViewClick(operacion)}
              className="text-mediumBlue hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
            >
              <MagnifyingGlassPlusIcon className="h-5 w-5" />
            </button>
          </td>
        </tr>
      ))}
      <tr className={`font-bold hidden md:table-row bg-lightBlue/10 h-[75px]`}>
        <td className="py-3 px-2 pl-10" colSpan={4}>
          Total
        </td>
        <td className="py-3 px-2 text-center">
          ${formatNumber(Number(filteredTotals?.valor_reserva))}
        </td>
        <td className="py-3 px-2 text-center">
          {filteredTotals?.promedio_punta_compradora_porcentaje !== undefined &&
          filteredTotals?.promedio_punta_compradora_porcentaje !== null &&
          filteredTotals?.promedio_punta_compradora_porcentaje !== 0 ? (
            <>
              {`${formatNumber(
                Number(filteredTotals?.promedio_punta_compradora_porcentaje)
              )}%`}
              <InformationCircleIcon
                className="inline-block mb-1 ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                data-tooltip-id="tooltip-compradora"
                data-tooltip-content="Promedio del % excluyendo alquileres y operaciones abiertas. Puntas no obtenidas / 0% (no existentes) no son tomadas en cuenta."
              />
              <Tooltip id="tooltip-compradora" place="top" />
            </>
          ) : (
            'N/A'
          )}
        </td>
        <td className="py-3 px-2 text-center">
          {filteredTotals?.promedio_punta_vendedora_porcentaje !== undefined &&
          filteredTotals?.promedio_punta_vendedora_porcentaje !== null &&
          filteredTotals?.promedio_punta_vendedora_porcentaje !== 0 ? (
            <>
              {`${formatNumber(
                Number(filteredTotals?.promedio_punta_vendedora_porcentaje)
              )}%`}
              <InformationCircleIcon
                className="inline-block mb-1  ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                data-tooltip-id="tooltip-vendedora"
                data-tooltip-content="Promedio del % excluyendo alquileres y operaciones abiertas. Puntas no obtenidas / 0% (no existentes) no son tomadas en cuenta."
              />
              <Tooltip id="tooltip-vendedora" place="top" />
            </>
          ) : (
            'N/A'
          )}
        </td>
        <td className="text-center pr-2">
          {filteredTotals?.promedio_suma_puntas !== undefined &&
          filteredTotals?.promedio_suma_puntas !== null &&
          !isNaN(filteredTotals?.promedio_suma_puntas) &&
          filteredTotals?.promedio_suma_puntas !== 0 ? (
            <>
              {formatNumber(Number(filteredTotals?.promedio_suma_puntas))}%
              <InformationCircleIcon
                className="inline-block mb-1 ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                data-tooltip-id="tooltip-puntas"
                data-tooltip-content="Promedio del % excluyendo alquileres y operaciones abiertas. Puntas no obtenidas / 0% (no existentes) no son tomadas en cuenta."
              />
              <Tooltip id="tooltip-puntas" place="top" />
            </>
          ) : (
            'N/A'
          )}
        </td>

        <td className="py-3 px-2 text-center">
          {filteredTotals?.suma_total_de_puntas !== undefined &&
          filteredTotals?.suma_total_de_puntas !== null ? (
            <>{formatNumber(Number(filteredTotals?.suma_total_de_puntas))}</>
          ) : (
            'Cálculo no disponible'
          )}
        </td>
        <td className="py-3 px-2 text-center">
          ${formatNumber(Number(filteredTotals?.honorarios_broker))}
        </td>
        <td className="py-3 px-2 text-center">
          {currentOperations.length > 0 ? (
            <>{`${currencySymbol}${formatNumber(totalNetFees)}`}</>
          ) : (
            'Cálculo no disponible'
          )}
        </td>
        <td className="py-3 px-2 text-center" colSpan={4}></td>
      </tr>
    </tbody>
  );
};

export default OperationsTableBody;
