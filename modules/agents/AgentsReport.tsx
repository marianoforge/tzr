// components/AgentsReport.tsx
import React, { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { UserPlusIcon } from '@heroicons/react/24/solid';

import AddUserModal from './AddUserModal';
import EditAgentsModal from './EditAgentsModal';

import { formatNumber } from '@/common/utils/formatNumber';
import {
  calculateAdjustedBrokerFees,
  calculateTotalBuyerTips,
  calculateTotalOperations,
  calculateTotalReservationValue,
  calculateTotalSellerTips,
  calculateTotalTips,
} from '@/common/utils/calculationsAgents';
import { Operation } from '@/common/types';
import ModalDelete from '@/components/PrivateComponente/CommonComponents/Modal';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { calculateTotals } from '@/common/utils/calculations';
import { currentYearOperations } from '@/common/utils/currentYearOps';
import { fetchUserOperations } from '@/lib/api/operationsApi';

export type TeamMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  teamLeadId: string;
  numeroTelefono: string;
  operations: Operation[];
  [key: string]: string | Operation[];
};

type AgentsReportProps = {
  userId: string;
};

const fetchTeamMembersWithOperations = async (): Promise<TeamMember[]> => {
  const response = await fetch('/api/getTeamsWithOperations');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

const deleteMember = async (memberId: string) => {
  const response = await fetch(`/api/teamMembers/${memberId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete member');
  }
};

const updateMember = async (updatedMember: TeamMember) => {
  const response = await fetch(`/api/teamMembers/${updatedMember.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedMember),
  });
  if (!response.ok) {
    throw new Error('Failed to update member');
  }
  return response.json();
};

const AgentsReport: React.FC<AgentsReportProps> = ({ userId }) => {
  const queryClient = useQueryClient();

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, error, isLoading } = useQuery({
    queryKey: ['teamMembersWithOperations'],
    queryFn: fetchTeamMembersWithOperations,
  });
  const { data: operations = [] } = useQuery({
    queryKey: ['operations', userId],
    queryFn: () => fetchUserOperations(userId || ''),
    enabled: !!userId,
  });

  const deleteMemberMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teamMembersWithOperations'],
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teamMembersWithOperations'],
      });
    },
  });

  const handleAddAdvisorClick = useCallback(() => {
    setIsAddUserModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    (memberId: string) => {
      deleteMemberMutation.mutate(memberId);
    },
    [deleteMemberMutation]
  );

  const handleEditClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  }, []);

  const handleDeleteButtonClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (updatedMember: TeamMember) => {
      updateMemberMutation.mutate(updatedMember, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    },
    [updateMemberMutation]
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;

  // Filter, sort, and paginate members
  const filteredMembers =
    data
      ?.filter((member) => {
        const fullName = `${member.firstName.toLowerCase()} ${member.lastName.toLowerCase()}`;
        const searchWords = searchQuery.toLowerCase().split(' ');
        return (
          member.teamLeadID === userId &&
          searchWords.every((word) => fullName.includes(word))
        );
      })
      .sort(
        (a, b) =>
          calculateAdjustedBrokerFees(b.operations) -
          calculateAdjustedBrokerFees(a.operations)
      ) || [];
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totals = calculateTotals(currentYearOperations(operations));

  const totalHonorariosBroker = Number(totals.honorarios_broker_cerradas);

  if (isLoading) {
    return <SkeletonLoader height={60} count={14} />;
  }

  return (
    <div className="bg-white p-4 mt-20 mb-20 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Buscar Asesor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[220px] p-2 border border-gray-300 rounded font-semibold mr-4 placeholder-mediumBlue placeholder-italic"
        />
        <h2 className="text-2xl font-bold">Informe Asesores</h2>
        <div className="flex items-center">
          <button
            onClick={handleAddAdvisorClick}
            className="flex items-center hover:text-mediumBlue"
          >
            <UserPlusIcon className="w-5 h-5 mr-2 text-lightBlue" />
            Agregar Asesor
          </button>
        </div>
      </div>
      {paginatedMembers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-lightBlue/10">
                <th className="py-3 px-4 font-semibold text-start">
                  Nombre y Apellido
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Total Facturación Bruta
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Aporte a la Facturación Bruta
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Cantidad de Operaciones
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Puntas Compradoras
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Puntas Vendedoras
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Puntas Totales
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Monto Total Operaciones
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((member, index) => (
                <tr
                  key={member.id}
                  className={`border-b text-center h-[75px] ${
                    currentPage === 1 && index === 0 ? 'bg-green-100' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-start w-1/5">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="py-3 px-4">
                    {member.operations.length > 0 ? (
                      <ul>
                        <li>
                          $
                          {formatNumber(
                            calculateAdjustedBrokerFees(member.operations)
                          )}
                        </li>
                      </ul>
                    ) : (
                      <span>No operations</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {member.operations.length > 0 ? (
                      <ul>
                        <li>
                          {formatNumber(
                            (calculateAdjustedBrokerFees(member.operations) *
                              100) /
                              Number(totalHonorariosBroker ?? 1)
                          )}
                          %
                        </li>
                      </ul>
                    ) : (
                      <span>No operations</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {calculateTotalOperations(member.operations)}
                  </td>
                  <td className="py-3 px-4">
                    {calculateTotalBuyerTips(member.operations)}
                  </td>
                  <td className="py-3 px-4">
                    {calculateTotalSellerTips(member.operations)}
                  </td>
                  <td className="py-3 px-4">
                    {calculateTotalTips(member.operations)}
                  </td>
                  <td className="py-3 px-4">
                    $
                    {formatNumber(
                      calculateTotalReservationValue(member.operations)
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {member.id !== userId && (
                      <>
                        <button
                          onClick={() => handleEditClick(member)}
                          className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteButtonClick(member)}
                          className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold ml-4"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No team members found for this team lead.</p>
      )}

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

      {isAddUserModalOpen && (
        <AddUserModal onClose={() => setIsAddUserModalOpen(false)} />
      )}
      {isModalOpen && selectedMember && (
        <EditAgentsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCloseAndUpdate={() => setIsModalOpen(false)}
          member={selectedMember}
          onSubmit={handleSubmit}
        />
      )}

      <ModalDelete
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        message="¿Estás seguro de que deseas eliminar este miembro?"
        onSecondButtonClick={() => {
          if (selectedMember?.id) {
            handleDeleteClick(selectedMember.id);
            setIsDeleteModalOpen(false);
          }
        }}
        secondButtonText="Borrar Miembro"
        className="w-[450px]"
      />
    </div>
  );
};

export default AgentsReport;
