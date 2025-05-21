import React from 'react';

import { calculateHonorarios } from '@/common/utils/calculations';
import { Operation } from '@/common/types';

import { TeamMemberSectionProps } from '../types';

import OperationSummaryTable from './OperationSummaryTable';
import OperationDetailsTable from './OperationDetailsTable';

const TeamMemberSection: React.FC<TeamMemberSectionProps> = ({
  agentId,
  operations,
  teamMembers,
  expandedAgents,
  currentPage,
  toggleAgentOperations,
  handlePageChange,
  openOperationDetails,
}) => {
  const ITEMS_PER_PAGE = 10;

  // Función para obtener el nombre del agente a partir del ID
  const getAgentName = (agentId: string) => {
    const agent = teamMembers.find((m) => m.id === agentId);
    return agent
      ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim()
      : agentId;
  };

  // Función para calcular el resumen de operaciones por tipo
  const getOperationsSummaryByType = (operations: Operation[]) => {
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
      .filter(
        (summary): summary is NonNullable<typeof summary> => summary !== null
      );
  };

  // Obtener resumen por tipo de operación
  const operationsSummaries = getOperationsSummaryByType(operations);

  // Pagination logic
  const currentPageIndex = currentPage[agentId] || 1;
  const totalPages = Math.ceil(operations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPageIndex - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOperations = operations.slice(startIndex, endIndex);

  return (
    <div className="border rounded-lg overflow-hidden shadow">
      <div className="bg-gray-100 p-4 border-b">
        <h2 className="text-xl font-semibold">
          Asesor: {getAgentName(agentId)}
        </h2>
        <div className="flex items-center text-sm text-gray-600">
          <span>{operations.length} operaciones encontradas</span>
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

      <OperationSummaryTable operationsSummaries={operationsSummaries} />

      {/* Detailed Operations Table */}
      {expandedAgents[agentId] && (
        <OperationDetailsTable
          operations={paginatedOperations}
          currentPageIndex={currentPageIndex}
          totalPages={totalPages}
          agentId={agentId}
          handlePageChange={handlePageChange}
          openOperationDetails={openOperationDetails}
          getAgentName={getAgentName}
        />
      )}
    </div>
  );
};

export default TeamMemberSection;
