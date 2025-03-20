import React, { useState } from 'react';

import { useGetOfficesData } from '@/common/hooks/useGetOfficesData';
import { Operation } from '@/common/types';

const OfficeAdmin = () => {
  const { officeOperations, isLoading, error, refetch } = useGetOfficesData();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error.message}</span>
        <button
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => refetch()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Filtrar operaciones basado en búsqueda y estado
  const filteredOperations = officeOperations.filter((op: Operation) => {
    const matchesSearch =
      op.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.teamId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.tipo_operacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.estado?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || op.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOperationClick = (operation: Operation) => {
    setSelectedOperation(operation);
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'activo':
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Agrupamos operaciones por oficina (teamId)
  const officeGroups = filteredOperations.reduce(
    (groups: Record<string, Operation[]>, operation: Operation) => {
      const teamId = operation.teamId || 'Sin Equipo';
      if (!groups[teamId]) {
        groups[teamId] = [];
      }
      groups[teamId].push(operation);
      return groups;
    },
    {} as Record<string, Operation[]>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Administración de Oficinas</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar operación..."
            className="w-full p-2 border border-gray-300 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="p-2 border border-gray-300 rounded w-full md:w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="pendiente">Pendiente</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => refetch()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Actualizar
          </button>
        </div>
      </div>

      {filteredOperations.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No se encontraron operaciones para las oficinas con los filtros
          actuales.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(officeGroups).map(([teamId, operations]) => {
            // Type assertion for operations
            const typedOperations = operations as Operation[];
            return (
              <div
                key={teamId}
                className="border rounded-lg overflow-hidden shadow"
              >
                <div className="bg-gray-100 p-4 border-b">
                  <h2 className="text-xl font-semibold">Oficina: {teamId}</h2>
                  <div className="text-sm text-gray-600">
                    {typedOperations.length} operaciones encontradas
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 border-b text-left">ID</th>
                        <th className="py-3 px-4 border-b text-left">Tipo</th>
                        <th className="py-3 px-4 border-b text-left">Estado</th>
                        <th className="py-3 px-4 border-b text-left">Fecha</th>
                        <th className="py-3 px-4 border-b text-left">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {typedOperations.map((operation: Operation) => (
                        <tr
                          key={operation.id}
                          onClick={() => handleOperationClick(operation)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="py-2 px-4 border-b">{operation.id}</td>
                          <td className="py-2 px-4 border-b">
                            {operation.tipo_operacion || 'N/A'}
                          </td>
                          <td className="py-2 px-4 border-b">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(operation.estado)}`}
                            >
                              {operation.estado || 'Sin estado'}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            {operation.fecha_captacion
                              ? new Date(
                                  operation.fecha_captacion
                                ).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="py-2 px-4 border-b">
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOperationClick(operation);
                              }}
                            >
                              Ver detalles
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para ver detalles de la operación */}
      {selectedOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Detalles de Operación</h3>
                <button
                  onClick={() => setSelectedOperation(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID de Operación</p>
                  <p className="font-medium">{selectedOperation.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ID de Equipo</p>
                  <p className="font-medium">
                    {selectedOperation.teamId || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo de Operación</p>
                  <p className="font-medium">
                    {selectedOperation.tipo_operacion || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="font-medium">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(selectedOperation.estado)}`}
                    >
                      {selectedOperation.estado || 'Sin estado'}
                    </span>
                  </p>
                </div>

                {/* Puedes agregar más campos según sea necesario */}

                {selectedOperation.honorarios_broker && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Descripción</p>
                    <p className="font-medium">
                      {selectedOperation.honorarios_broker}
                    </p>
                  </div>
                )}

                {selectedOperation.fecha_captacion && (
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Creación</p>
                    <p className="font-medium">
                      {new Date(
                        selectedOperation.fecha_captacion
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                  onClick={() => setSelectedOperation(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeAdmin;
