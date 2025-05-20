import React, { useState } from 'react';

import { useGetTeamData } from '@/common/hooks/useGetTeamData';
import { Operation } from '@/common/types';
import { formatOperationsNumber } from '@/common/utils/formatNumber';
import { calculateHonorarios } from '@/common/utils/calculations';
import { formatDate } from '@/common/utils/formatDate';

interface OperationSummary {
  tipo: string;
  totalValue: number;
  averagePuntas: number;
  totalGrossFees: number;
  totalNetFees: number;
  exclusivityPercentage: number;
  operationsCount: number;
}

// Interfaz para resumenes globales
interface GlobalSummary {
  totalValue: number;
  totalGrossFees: number;
  totalNetFees: number;
  totalOperations: number;
  teamMembersCount: number;
}

// Operation Details Modal Component
interface OperationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation;
}

// Helper function to safely format dates
const safeFormatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return formatDate(dateString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || 'N/A';
  }
};

const OperationDetailsModal: React.FC<OperationDetailsModalProps> = ({
  isOpen,
  onClose,
  operation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-4/5 lg:w-3/5 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Detalles de la Operación
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[calc(100vh-200px)] overflow-y-auto px-2">
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              INFORMACIÓN GENERAL
            </h4>
            <p>
              <span className="font-semibold">Tipo de Operación:</span>{' '}
              {operation.tipo_operacion || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Tipo de Inmueble:</span>{' '}
              {operation.tipo_inmueble || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Estado:</span>{' '}
              <span className="font-medium px-2 py-1 bg-[#0077b6]/10 rounded-full">
                {operation.estado || 'N/A'}
              </span>
            </p>
            <p>
              <span className="font-semibold">Fecha de Operación:</span>{' '}
              {safeFormatDate(operation.fecha_operacion)}
            </p>
            <p>
              <span className="font-semibold">Fecha de Captación:</span>{' '}
              {safeFormatDate(operation.fecha_captacion)}
            </p>
            <p>
              <span className="font-semibold">Fecha de Reserva:</span>{' '}
              {safeFormatDate(operation.fecha_reserva)}
            </p>
            <p>
              <span className="font-semibold">Exclusiva:</span>{' '}
              <span
                className={`font-medium px-2 py-1 rounded-full ${operation.exclusiva ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
              >
                {operation.exclusiva ? 'Sí' : 'No'}
              </span>
            </p>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              UBICACIÓN
            </h4>
            <p>
              <span className="font-semibold">Dirección:</span>{' '}
              {operation.direccion_reserva || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Localidad:</span>{' '}
              {operation.localidad_reserva || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Provincia:</span>{' '}
              {operation.provincia_reserva || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">País:</span>{' '}
              {operation.pais || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Número de Casa:</span>{' '}
              {operation.numero_casa || 'N/A'}
            </p>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              VALORES
            </h4>
            <p>
              <span className="font-semibold">Valor de Reserva:</span>{' '}
              <span className="font-medium text-green-700">
                ${formatOperationsNumber(operation.valor_reserva || 0) || '0'}
              </span>
            </p>
            <p>
              <span className="font-semibold">Honorarios Broker:</span>{' '}
              <span className="font-medium text-green-700">
                $
                {formatOperationsNumber(operation.honorarios_broker || 0) ||
                  '0'}
              </span>
            </p>
            <p>
              <span className="font-semibold">Honorarios Asesor:</span>{' '}
              <span className="font-medium text-green-700">
                $
                {formatOperationsNumber(operation.honorarios_asesor || 0) ||
                  '0'}
              </span>
            </p>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              COMISIONES Y PUNTAS
            </h4>
            <p>
              <span className="font-semibold">% Honorarios Asesor:</span>{' '}
              {formatOperationsNumber(
                operation.porcentaje_honorarios_asesor || 0,
                true
              ) || '0%'}
            </p>
            <p>
              <span className="font-semibold">% Honorarios Broker:</span>{' '}
              {formatOperationsNumber(
                operation.porcentaje_honorarios_broker || 0,
                true
              ) || '0%'}
            </p>
            <div className="mt-4">
              <p className="font-semibold mb-2">Puntas:</p>
              <div className="grid grid-cols-2 gap-2 ml-4">
                <p>
                  <span className="font-medium">Compradora:</span>{' '}
                  <span
                    className={`ml-1 ${operation.punta_compradora ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {operation.punta_compradora ? 'Sí' : 'No'}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Vendedora:</span>{' '}
                  <span
                    className={`ml-1 ${operation.punta_vendedora ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {operation.punta_vendedora ? 'Sí' : 'No'}
                  </span>
                </p>
                <p>
                  <span className="font-medium">% Compradora:</span>{' '}
                  {formatOperationsNumber(
                    operation.porcentaje_punta_compradora || 0,
                    true
                  ) || '0%'}
                </p>
                <p>
                  <span className="font-medium">% Vendedora:</span>{' '}
                  {formatOperationsNumber(
                    operation.porcentaje_punta_vendedora || 0,
                    true
                  ) || '0%'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              COMPARTIDO Y REFERIDO
            </h4>
            <p>
              <span className="font-semibold">Compartido Con:</span>{' '}
              {operation.compartido || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">% Compartido:</span>{' '}
              {formatOperationsNumber(
                operation.porcentaje_compartido || 0,
                true
              ) || '0%'}
            </p>
            <p>
              <span className="font-semibold">Referido:</span>{' '}
              {operation.referido || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">% Referido:</span>{' '}
              {formatOperationsNumber(
                operation.porcentaje_referido || 0,
                true
              ) || '0%'}
            </p>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              ASESORES
            </h4>
            <p>
              <span className="font-semibold">Realizador de Venta:</span>{' '}
              {operation.realizador_venta || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Realizador Adicional:</span>{' '}
              {operation.realizador_venta_adicional || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">
                % Honorarios Asesor Adicional:
              </span>{' '}
              {formatOperationsNumber(
                operation.porcentaje_honorarios_asesor_adicional || 0,
                true
              ) || '0%'}
            </p>
          </div>

          <div className="md:col-span-2 space-y-3 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              INFORMACIÓN ADICIONAL
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-semibold">Sobre Reserva #:</span>{' '}
                  {operation.numero_sobre_reserva || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Monto Sobre Reserva:</span> $
                  {formatOperationsNumber(operation.monto_sobre_reserva || 0) ||
                    '0'}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold">Sobre Refuerzo #:</span>{' '}
                  {operation.numero_sobre_refuerzo || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Monto Sobre Refuerzo:</span> $
                  {formatOperationsNumber(
                    operation.monto_sobre_refuerzo || 0
                  ) || '0'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Observaciones:</p>
              <p className="mt-1 p-2 bg-white rounded border border-gray-200 min-h-[60px]">
                {operation.observaciones || 'Sin observaciones'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0077b6] text-white rounded-md hover:bg-[#0077b6]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0077b6]/50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const TeamAdmin = () => {
  const { teamMembers, teamOperations, isLoading, error, refetch } =
    useGetTeamData();
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;

  // Toggle visibility of detailed operations for an agent
  const toggleAgentOperations = (agentId: string) => {
    setExpandedAgents((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
    // Reset to first page when showing operations
    setCurrentPage((prev) => ({
      ...prev,
      [agentId]: 1,
    }));
  };

  // Handle page change
  const handlePageChange = (agentId: string, page: number) => {
    setCurrentPage((prev) => ({
      ...prev,
      [agentId]: page,
    }));
  };

  // Open modal with operation details
  const openOperationDetails = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOperation(null);
  };

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

  // Agrupar operaciones por agente (ID del usuario)
  const agentGroups = teamOperations.reduce(
    (groups: Record<string, Operation[]>, operation: Operation) => {
      const agentId = operation.user_uid || 'Sin Asignación';
      if (!groups[agentId]) {
        groups[agentId] = [];
      }
      groups[agentId].push(operation);
      return groups;
    },
    {} as Record<string, Operation[]>
  );

  // Función para obtener el nombre del agente a partir del ID
  const getAgentName = (agentId: string) => {
    const agent = teamMembers.find((m) => m.id === agentId);
    return agent
      ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim()
      : agentId;
  };

  // Función para calcular el resumen de operaciones por tipo
  const getOperationsSummaryByType = (
    operations: Operation[]
  ): OperationSummary[] => {
    // Agrupar operaciones por tipo
    const operationTypes = Array.from(
      new Set(
        operations
          .map((op) => op.tipo_operacion)
          .filter((tipo): tipo is string => Boolean(tipo))
      )
    );

    return operationTypes
      .map((tipo) => {
        const opsOfType = operations.filter((op) => op.tipo_operacion === tipo);

        if (opsOfType.length === 0) return null;

        // Calcular totales
        const totalValue = opsOfType.reduce(
          (sum, op) => sum + (op.valor_reserva || 0),
          0
        );

        // Calcular promedio de puntas
        const totalPuntas = opsOfType.reduce(
          (sum, op) =>
            sum +
            ((op.porcentaje_punta_compradora || 0) +
              (op.porcentaje_punta_vendedora || 0)),
          0
        );
        const averagePuntas =
          opsOfType.length > 0 ? totalPuntas / opsOfType.length : 0;

        // Calcular honorarios brutos
        const totalGrossFees = opsOfType.reduce((sum, op) => {
          const honorarios = calculateHonorarios(
            op.valor_reserva || 0,
            op.porcentaje_honorarios_asesor || 0,
            op.porcentaje_honorarios_broker || 0,
            op.porcentaje_compartido || 0,
            op.porcentaje_referido || 0
          ).honorariosBroker;
          return sum + honorarios;
        }, 0);

        // Calcular honorarios netos (asumiendo que son los honorarios de asesor)
        const totalNetFees = opsOfType.reduce(
          (sum, op) => sum + (op.honorarios_asesor || 0),
          0
        );

        // Calcular porcentaje de exclusividad
        const exclusiveOps = opsOfType.filter((op) => op.exclusiva === true);
        const exclusivityPercentage =
          opsOfType.length > 0
            ? (exclusiveOps.length / opsOfType.length) * 100
            : 0;

        return {
          tipo,
          totalValue,
          averagePuntas,
          totalGrossFees,
          totalNetFees,
          exclusivityPercentage,
          operationsCount: opsOfType.length,
        };
      })
      .filter((summary): summary is OperationSummary => summary !== null);
  };

  // Calcular el resumen global de todos los agentes
  const calculateGlobalSummary = (): GlobalSummary => {
    const totalValue = teamOperations.reduce(
      (sum, op) => sum + (op.valor_reserva || 0),
      0
    );

    const totalGrossFees = teamOperations.reduce((sum, op) => {
      const honorarios = calculateHonorarios(
        op.valor_reserva || 0,
        op.porcentaje_honorarios_asesor || 0,
        op.porcentaje_honorarios_broker || 0,
        op.porcentaje_compartido || 0,
        op.porcentaje_referido || 0
      ).honorariosBroker;
      return sum + honorarios;
    }, 0);

    const totalNetFees = teamOperations.reduce(
      (sum, op) => sum + (op.honorarios_asesor || 0),
      0
    );

    return {
      totalValue,
      totalGrossFees,
      totalNetFees,
      totalOperations: teamOperations.length,
      teamMembersCount: teamMembers.length,
    };
  };

  const globalSummary = calculateGlobalSummary();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Administración de Equipo</h1>

      {/* Resumen Global */}
      <div className="bg-[#00b6d6]/10 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold text-[#0077b6] mb-4">
          Resumen Global
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Valor Total</p>
            <p className="text-2xl font-bold">
              ${formatOperationsNumber(globalSummary.totalValue)}
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Honorarios Brutos</p>
            <p className="text-2xl font-bold">
              ${formatOperationsNumber(globalSummary.totalGrossFees)}
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Honorarios Netos</p>
            <p className="text-2xl font-bold">
              ${formatOperationsNumber(globalSummary.totalNetFees)}
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Total Operaciones</p>
            <p className="text-2xl font-bold">
              {globalSummary.totalOperations}
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Miembros del Equipo</p>
            <p className="text-2xl font-bold">
              {globalSummary.teamMembersCount}
            </p>
          </div>
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No se encontraron miembros en tu equipo.
        </div>
      ) : teamOperations.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No se encontraron operaciones para los miembros de tu equipo.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(agentGroups).map(([agentId, operations]) => {
            // Type assertion for operations
            const typedOperations = operations as Operation[];
            // Obtener resumen por tipo de operación
            const operationsSummaries =
              getOperationsSummaryByType(typedOperations);

            // Pagination logic
            const currentPageIndex = currentPage[agentId] || 1;
            const totalPages = Math.ceil(
              typedOperations.length / ITEMS_PER_PAGE
            );
            const startIndex = (currentPageIndex - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const paginatedOperations = typedOperations.slice(
              startIndex,
              endIndex
            );

            return (
              <div
                key={agentId}
                className="border rounded-lg overflow-hidden shadow"
              >
                <div className="bg-gray-100 p-4 border-b">
                  <h2 className="text-xl font-semibold">
                    Asesor: {getAgentName(agentId)}
                  </h2>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>
                      {typedOperations.length} operaciones encontradas
                    </span>
                    <button
                      onClick={() => toggleAgentOperations(agentId)}
                      className="ml-2 text-[#0077b6] hover:text-[#0077b6]/80 underline focus:outline-none"
                    >
                      {expandedAgents[agentId]
                        ? 'Ocultar operaciones'
                        : 'Ver todas las operaciones'}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-[#00b6d6]/10">
                      <tr>
                        <th className="py-3 px-4 border-b text-left">
                          Tipo de Operación
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          Valor Total
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          Promedio % Puntas
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          Honorarios Brutos
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          Honorarios Netos
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          % Exclusividad
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          Cantidad
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {operationsSummaries.map((summary) => (
                        <tr key={summary.tipo} className="hover:bg-gray-50">
                          <td className="py-3 px-4 border-b font-medium">
                            {summary.tipo}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            ${formatOperationsNumber(summary.totalValue)}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            {formatOperationsNumber(
                              summary.averagePuntas,
                              true
                            )}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            ${formatOperationsNumber(summary.totalGrossFees)}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            ${formatOperationsNumber(summary.totalNetFees)}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            {formatOperationsNumber(
                              summary.exclusivityPercentage,
                              true
                            )}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            {summary.operationsCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Detailed Operations Table */}
                {expandedAgents[agentId] && (
                  <div className="border-t overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead className="bg-[#00b6d6]/10">
                        <tr>
                          <th className="py-3 px-4 border-b text-left">
                            Tipo de Operación
                          </th>
                          <th className="py-3 px-4 border-b text-center">
                            Valor
                          </th>
                          <th className="py-3 px-4 border-b text-center">
                            % Puntas
                          </th>
                          <th className="py-3 px-4 border-b text-center">
                            Honorarios Brutos
                          </th>
                          <th className="py-3 px-4 border-b text-center">
                            Honorarios Netos
                          </th>
                          <th className="py-3 px-4 border-b text-center">
                            Exclusiva
                          </th>
                          <th className="py-3 px-4 border-b text-center">
                            Estado
                          </th>
                          <th className="py-3 px-4 border-b text-center">
                            Asesor Principal
                          </th>
                          <th className="py-3 px-4 border-b text-center">
                            +Info
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOperations.map((operation) => (
                          <tr key={operation.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-b">
                              {operation.tipo_operacion || 'N/A'}
                            </td>
                            <td className="py-3 px-4 border-b text-center">
                              $
                              {formatOperationsNumber(
                                operation.valor_reserva || 0
                              ) || '0'}
                            </td>
                            <td className="py-3 px-4 border-b text-center">
                              {formatOperationsNumber(
                                (operation.porcentaje_punta_compradora || 0) +
                                  (operation.porcentaje_punta_vendedora || 0),
                                true
                              ) || '0%'}
                            </td>
                            <td className="py-3 px-4 border-b text-center">
                              $
                              {formatOperationsNumber(
                                operation.honorarios_broker || 0
                              ) || '0'}
                            </td>
                            <td className="py-3 px-4 border-b text-center">
                              $
                              {formatOperationsNumber(
                                operation.honorarios_asesor || 0
                              ) || '0'}
                            </td>
                            <td className="py-3 px-4 border-b text-center">
                              {operation.exclusiva ? 'Sí' : 'No'}
                            </td>
                            <td className="py-3 px-4 border-b text-center">
                              {operation.estado || 'N/A'}
                            </td>
                            <td className="py-3 px-4 border-b text-center">
                              {operation.realizador_venta ||
                                getAgentName(operation.user_uid) ||
                                'N/A'}
                            </td>
                            <td className="py-3 px-4 border-b text-center">
                              <button
                                onClick={() => openOperationDetails(operation)}
                                className="text-[#0077b6] hover:text-[#0077b6]/80 font-medium focus:outline-none"
                              >
                                +Info
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center py-4 bg-gray-50">
                        <button
                          onClick={() =>
                            handlePageChange(agentId, currentPageIndex - 1)
                          }
                          disabled={currentPageIndex === 1}
                          className={`mx-1 px-3 py-1 rounded ${
                            currentPageIndex === 1
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-[#0077b6] text-white hover:bg-[#0077b6]/90'
                          }`}
                        >
                          &laquo; Anterior
                        </button>

                        <div className="flex mx-2">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => handlePageChange(agentId, i + 1)}
                              className={`mx-1 px-3 py-1 rounded ${
                                currentPageIndex === i + 1
                                  ? 'bg-[#0077b6] text-white'
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            handlePageChange(agentId, currentPageIndex + 1)
                          }
                          disabled={currentPageIndex === totalPages}
                          className={`mx-1 px-3 py-1 rounded ${
                            currentPageIndex === totalPages
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-[#0077b6] text-white hover:bg-[#0077b6]/90'
                          }`}
                        >
                          Siguiente &raquo;
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Operation Details Modal */}
      {selectedOperation && (
        <OperationDetailsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          operation={selectedOperation}
        />
      )}
    </div>
  );
};

export default TeamAdmin;
