import React from 'react';
import SkeletonLoader from '@/components/TrackerComponents/CommonComponents/SkeletonLoader';
import { UserData, Operation } from '@/types';
import { OPERATIONS_LIST_COLORS } from '@/lib/constants';
import { formatNumber } from '@/utils/formatNumber';

import useAgentsData from '@/hooks/useAgentsData';
import usePagination from '@/hooks/usePagination'; // Importa el hook de paginación

const AgentsReportByOps = ({ currentUser }: { currentUser: UserData }) => {
  const { currentAgents, isLoading, error, searchQuery, setSearchQuery } =
    useAgentsData(currentUser);

  // Combina todas las operaciones de todos los agentes en una sola lista
  const allOperations = currentAgents.flatMap((usuario) =>
    usuario.operaciones
      .map((operacion) => ({
        ...operacion,
        agente: `${usuario.firstName} ${usuario.lastName}`, // Agrega el nombre del asesor
      }))
      .filter((op) => op.estado === 'Cerrada')
  );

  // Aplica la paginación con 10 elementos por página
  const {
    currentItems: paginatedOperations,
    currentPage,
    totalPages,
    handlePageChange,
    disablePagination,
  } = usePagination(allOperations, 10);

  if (isLoading) {
    return <SkeletonLoader height={60} count={14} />;
  }
  if (error) {
    return <p>Error: {error?.message || 'An unknown error occurred'}</p>;
  }

  return (
    <div className="bg-white p-4 mt-20 mb-20 rounded-xl shadow-md">
      <div className="flex items-center mb-4 w-full">
        <h2 className="text-2xl font-bold text-center w-full">
          Informe Operaciones Por Asesores
        </h2>
      </div>
      <div className="flex items-center justify-center mb-4">
        <input
          type="text"
          placeholder="Ingresa el nombre del asesor para ver sus operaciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[460px] p-2 border border-gray-300 rounded font-semibold mr-4 placeholder-mediumBlue placeholder-italic text-center"
        />
      </div>
      {searchQuery === '' ? (
        <div className="flex flex-col items-center justify-center gap-4 my-6"></div>
      ) : paginatedOperations.length === 0 ? (
        <p className="text-center">No existen agentes con ese nombre</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`bg-lightBlue/10 ${OPERATIONS_LIST_COLORS.headerText}`}
              >
                <th className="py-3 px-4 font-semibold">Agente</th>
                <th className="py-3 px-4 font-semibold">Operación</th>
                <th className="py-3 px-4 font-semibold text-center">
                  Monto de Operación
                </th>
                <th className="py-3 px-4 font-semibold text-center">Tipo</th>
                <th className="py-3 px-4 font-semibold text-center">Fecha</th>
                <th className="py-3 px-4 font-semibold text-center">
                  Punta Compradora
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Punta Vendedora
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Puntas de la Operación
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOperations.map(
                (operacion: Operation, index: number) => (
                  <tr key={index} className="border-b text-center h-[75px]">
                    <td className="py-3 px-4 text-start">
                      {operacion.realizador_venta}
                    </td>
                    <td className="py-3 px-4 text-start">
                      {operacion.direccion_reserva}
                    </td>
                    <td className="py-3 px-4">
                      ${formatNumber(operacion.valor_reserva)}
                    </td>
                    <td className="py-3 px-4">{operacion.tipo_operacion}</td>
                    <td className="py-3 px-4">{operacion.fecha_operacion}</td>
                    <td className="py-3 px-4">
                      {operacion.punta_compradora === true ? 1 : 0}
                    </td>
                    <td className="py-3 px-4">
                      {operacion.punta_vendedora === true ? 1 : 0}
                    </td>
                    <td className="py-3 px-4">
                      {Number(operacion.punta_compradora) +
                        Number(operacion.punta_vendedora)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {!disablePagination && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
          >
            Anterior
          </button>
          <span className="px-4 py-2 mx-1">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentsReportByOps;
