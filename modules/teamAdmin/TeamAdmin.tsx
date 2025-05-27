import React, { useState, useMemo } from 'react';

import { useGetTeamData } from '@/common/hooks/useGetTeamData';
import { Operation } from '@/common/types';
import { calculateHonorarios } from '@/common/utils/calculations';

import { TeamMember } from './types';

// Import sub-components
import FilterSection from './components/FilterSection';
import GlobalSummary from './components/GlobalSummary';
import OperationDetailsModal from './components/OperationDetailsModal';
import TeamMemberSection from './components/TeamMemberSection';
import TeamMembersWithoutOperations from './components/TeamMembersWithoutOperations';

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
  // Filtros de año y mes
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Aplicar filtros a las operaciones
  const filteredOperations = useMemo(() => {
    if (!teamOperations || teamOperations.length === 0) return [];

    return teamOperations.filter((operation) => {
      // Usamos fecha_operacion o, en su defecto, fecha_reserva o fecha_captacion
      const rawDate =
        operation.fecha_operacion ||
        operation.fecha_reserva ||
        operation.fecha_captacion;

      if (!rawDate) return false;

      // Interpretamos la fecha en UTC para evitar problemas de zona horaria
      const operationDate = new Date(rawDate + 'T00:00:00Z');
      const operationYear = operationDate.getUTCFullYear();
      const operationMonth = operationDate.getUTCMonth() + 1; // Convertido a 1-indexado

      let dateMatch = false;

      if (yearFilter === 'all' && monthFilter === 'all') {
        // Incluir todas las operaciones
        dateMatch = true;
      } else if (yearFilter === 'all' && monthFilter !== 'all') {
        const monthNumber = parseInt(monthFilter, 10);
        // Operaciones con el mes indicado, de cualquier año
        dateMatch = operationMonth === monthNumber;
      } else if (yearFilter !== 'all' && monthFilter === 'all') {
        // Filtrar solo por el año especificado
        dateMatch = operationYear === Number(yearFilter);
      } else {
        // Filtrar por un año y mes específicos
        const monthNumber = parseInt(monthFilter, 10);
        const yearNumber = Number(yearFilter);
        dateMatch =
          operationYear === yearNumber && operationMonth === monthNumber;
      }

      // Filtrar por estado
      const statusMatch =
        statusFilter === 'all' || operation.estado === statusFilter;

      return dateMatch && statusMatch;
    });
  }, [teamOperations, yearFilter, monthFilter, statusFilter]);

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

  // Buscar miembro del equipo por user_uid para obtener su nombre completo
  const findTeamMemberByUid = (uid: string): TeamMember | undefined => {
    return teamMembers.find((member) => member.advisorUid === uid);
  };

  // Agrupar operaciones por agente (ID del usuario) y utilizar el ID del miembro del equipo correspondiente si existe
  const agentGroups = filteredOperations.reduce(
    (groups: Record<string, Operation[]>, operation: Operation) => {
      const uid = operation.user_uid || 'Sin Asignación';
      // Buscar el miembro del equipo correspondiente al uid
      const teamMember = findTeamMemberByUid(uid);

      // Usar el ID del miembro del equipo si existe, de lo contrario usar el uid original
      const agentId = teamMember ? teamMember.id : uid;

      if (!groups[agentId]) {
        groups[agentId] = [];
      }
      groups[agentId].push(operation);
      return groups;
    },
    {} as Record<string, Operation[]>
  );

  // Calcular el resumen global con operaciones filtradas
  const calculateGlobalSummary = () => {
    const totalGrossFees = filteredOperations.reduce((sum, op) => {
      const honorarios = calculateHonorarios(
        op.valor_reserva || 0,
        op.porcentaje_honorarios_asesor || 0,
        op.porcentaje_honorarios_broker || 0,
        op.porcentaje_compartido || 0,
        op.porcentaje_referido || 0
      ).honorariosBroker;
      return sum + honorarios;
    }, 0);

    const totalNetFees = filteredOperations.reduce(
      (sum, op) => sum + (op.honorarios_asesor || 0),
      0
    );

    return {
      totalGrossFees,
      totalNetFees,
      totalOperations: filteredOperations.length,
      teamMembersCount: teamMembers.length,
    };
  };

  const globalSummary = calculateGlobalSummary();

  // Encontrar miembros del equipo sin operaciones
  const teamMembersWithoutOperations = teamMembers.filter((member) => {
    // Verificar si el miembro tiene un advisorUid asignado
    if (!member.advisorUid) return true;

    // Verificar si hay operaciones para este miembro
    return !filteredOperations.some(
      (op) =>
        op.user_uid === member.advisorUid ||
        op.user_uid_adicional === member.advisorUid
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seguimiento del Equipo</h1>

      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-gray-700 leading-relaxed">
          Esta tabla permite realizar un seguimiento detallado de los asesores
          que tienen cuentas activas en Realtor TrackPro. A través de la
          vinculación con la cuenta del Team Leader, es posible verificar el
          registro de operaciones en los perfiles individuales de cada asesor.
          Cabe destacar que esta conexión es únicamente informativa y no afecta
          en absoluto los indicadores ni los datos del perfil del Team Leader.
        </p>
      </div>

      {/* Filtros */}
      <FilterSection
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Resumen Global */}
      <GlobalSummary summary={globalSummary} />

      {teamMembers.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No se encontraron miembros en tu equipo.
        </div>
      ) : filteredOperations.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No se encontraron operaciones para los filtros seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(agentGroups).map(([agentId, operations]) => (
            <TeamMemberSection
              key={agentId}
              agentId={agentId}
              operations={operations}
              teamMembers={teamMembers as TeamMember[]}
              expandedAgents={expandedAgents}
              currentPage={currentPage}
              toggleAgentOperations={toggleAgentOperations}
              handlePageChange={handlePageChange}
              openOperationDetails={openOperationDetails}
            />
          ))}
        </div>
      )}

      {/* Sección de miembros sin operaciones */}
      <TeamMembersWithoutOperations
        teamMembersWithoutOperations={teamMembersWithoutOperations}
      />

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
