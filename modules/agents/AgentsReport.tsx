import React, { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { UserPlusIcon } from '@heroicons/react/24/solid';

import { formatNumber } from '@/common/utils/formatNumber';
import {
  calculateAdjustedBrokerFees,
  calculateTotalOperations,
  calculateTotalReservationValue,
  calculateTotalTips,
} from '@/common/utils/calculationsAgents';
import { Operation } from '@/common/types';
import ModalDelete from '@/components/PrivateComponente/CommonComponents/Modal';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { useAuthStore } from '@/stores/authStore';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
import Select from '@/components/PrivateComponente/CommonComponents/Select';
import { yearsFilter, monthsFilter } from '@/lib/data';

import EditAgentsModal from './EditAgentsModal';
import AddUserModal from './AddUserModal';

export type TeamMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  teamLeadID: string;
  numeroTelefono: string;
  operations: Operation[];
  [key: string]: string | Operation[];
};

type AgentsReportProps = {
  userId: string;
};

const fetchTeamMembersWithOperations = async (): Promise<TeamMember[]> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await fetch('/api/getTeamsWithOperations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

const deleteMember = async (memberId: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await fetch(`/api/teamMembers/${memberId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Failed to delete member');
  }
};

const updateMember = async (updatedMember: TeamMember) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await fetch(`/api/teamMembers/${updatedMember.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
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
  const { userID } = useAuthStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || '');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const { data, error, isLoading } = useQuery({
    queryKey: ['teamMembersWithOperations'],
    queryFn: fetchTeamMembersWithOperations,
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

  const filteredMembers =
    data
      ?.filter((member) => {
        const fullName = `${member.firstName.toLowerCase()} ${member.lastName.toLowerCase()}`;
        const searchWords = searchQuery.toLowerCase().split(' ');
        const operationsInSelectedYear = member.operations.filter(
          (operation) => {
            const operationDate = new Date(
              operation.fecha_operacion || operation.fecha_reserva || ''
            );
            const year = operationDate.getFullYear().toString();
            const month = (operationDate.getMonth() + 1).toString();

            // Filtrar por año seleccionado si no es "todos los años"
            if (selectedYear !== 'all' && year !== selectedYear) return false;

            // Filtrar por mes seleccionado si no es "todos los meses"
            if (selectedMonth !== 'all' && month !== selectedMonth)
              return false;

            return true;
          }
        );
        return (
          member.teamLeadID === userId &&
          searchWords.every((word) => fullName.includes(word)) &&
          operationsInSelectedYear.length > 0
        );
      })
      .sort(
        (a, b) =>
          calculateAdjustedBrokerFees(
            b.operations,
            selectedYear,
            selectedMonth
          ) -
          calculateAdjustedBrokerFees(a.operations, selectedYear, selectedMonth)
      ) || [];

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Primero calculamos el total de honorarios mostrados en la tabla actual
  const visibleTotalHonorarios = filteredMembers.reduce(
    (sum, member) =>
      sum +
      calculateAdjustedBrokerFees(
        member.operations,
        selectedYear,
        selectedMonth
      ),
    0
  );

  if (isLoading) {
    return <SkeletonLoader height={60} count={14} />;
  }
  if (error instanceof Error) return <div>Error: {error.message}</div>;

  return (
    <div className="bg-white p-4 mt-20 mb-20 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Buscar Asesor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[220px] p-2 border border-gray-300 rounded font-semibold mr-4 placeholder-mediumBlue placeholder-italic"
          />
          <div className="flex md:w-[400px] lg:w-[350px] xl:w-[450px] 2xl:w-[550px] lg:justify-around justify-center items-center space-x-4">
            <Select
              options={yearsFilter}
              value={selectedYear}
              onChange={(value: string | number) =>
                setSelectedYear(value.toString())
              }
              className="w-[200px] lg:w-[150px] xl:w-[200px] 2xl:w-[250px] h-[40px] p-2 border text-mediumBlue border-gray-300 rounded font-semibold lg:text-sm xl:text-base"
            />
            <Select
              options={monthsFilter}
              value={selectedMonth}
              onChange={(value: string | number) =>
                setSelectedMonth(value.toString())
              }
              className="w-[200px] lg:w-[150px] xl:w-[200px] 2xl:w-[250px] h-[40px] p-2 border text-mediumBlue border-gray-300 rounded font-semibold lg:text-sm xl:text-base"
            />
          </div>
        </div>
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
                          {currencySymbol}
                          {formatNumber(
                            calculateAdjustedBrokerFees(
                              member.operations,
                              selectedYear,
                              selectedMonth
                            )
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
                            (calculateAdjustedBrokerFees(
                              member.operations,
                              selectedYear,
                              selectedMonth
                            ) *
                              100) /
                              visibleTotalHonorarios
                          )}
                          %
                        </li>
                      </ul>
                    ) : (
                      <span>No operations</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {calculateTotalOperations(
                      member.operations,
                      selectedYear,
                      selectedMonth
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {calculateTotalTips(
                      member.operations,
                      selectedYear,
                      member.id,
                      selectedMonth
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {currencySymbol}
                    {formatNumber(
                      calculateTotalReservationValue(
                        member.operations,
                        selectedYear,
                        selectedMonth
                      )
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
