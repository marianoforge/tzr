import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

import SkeletonLoader from '@/components/TrackerComponents/CommonComponents/SkeletonLoader';
import { UserData, TeamMember, UserWithOperations } from '@/types';
import { OPERATIONS_LIST_COLORS } from '@/lib/constants';
import { formatNumber } from '@/utils/formatNumber';
import {
  calculateAdjustedBrokerFees,
  calculateTotalOperations,
  calculateTotalBuyerTips,
  calculateTotalSellerTips,
  calculateTotalTips,
  calculateTotalReservationValue,
} from '@/utils/calculationsAgents';
import useUsersWithOperations from '@/hooks/useUserWithOperations';
import { useTeamMembersOps } from '@/hooks/useTeamMembersOps';
import { filterAgentsBySearch } from '@/utils/filterOperations'; // Import the generic search filter function

import AddUserModal from '../Agents/AddUserModal';

import EditAgentsModal from './EditAgentsModal';
import ModalDelete from '@/components/TrackerComponents/CommonComponents/Modal';
// Utiliza los hooks adaptados a Tanstack Query
const AgentsReport = ({ currentUser }: { currentUser: UserData }) => {
  const queryClient = useQueryClient();

  // State hooks
  const [combinedData, setCombinedData] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Constants
  const itemsPerPage = 10;

  // Data fetching hooks
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useUsersWithOperations(currentUser);
  const {
    data: membersData,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useTeamMembersOps(currentUser.uid ?? '');

  // Callbacks
  const handleAddAdvisorClick = useCallback(() => {
    setIsAddUserModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    async (memberId: string) => {
      try {
        const response = await fetch(`/api/teamMembers/${memberId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCombinedData((prevData) =>
            prevData.filter((member) => member.id !== memberId)
          );
          queryClient.invalidateQueries({
            queryKey: ['teamMembersOps', currentUser.uid],
          });
        } else {
          console.error('Error al borrar el miembro');
        }
      } catch (error) {
        console.error('Error en la petición DELETE:', error);
      }
    },
    [queryClient, currentUser.uid]
  );

  const handleEditClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  }, []);

  const handleDeleteButtonClick = useCallback((member: TeamMember) => {
    setSelectedMember(member); // Set the selected member
    setIsDeleteModalOpen(true); // Open the delete modal
  }, []);

  const handleSubmit = useCallback(
    async (updatedMember: TeamMember) => {
      try {
        const response = await fetch(`/api/teamMembers/${updatedMember.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedMember),
        });

        if (response.ok) {
          setCombinedData((prevData) =>
            prevData.map((member) =>
              member.id === updatedMember.id ? updatedMember : member
            )
          );
          setIsModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: ['teamMembersOps', currentUser.uid],
          });
        } else {
          console.error('Error al actualizar el miembro');
        }
      } catch (error) {
        console.error('Error en la petición PUT:', error);
      }
    },
    [queryClient, currentUser.uid]
  );

  // Effects
  useEffect(() => {
    if (usersData && membersData) {
      const initialData: TeamMember[] = [
        ...usersData.map((user: UserWithOperations) => ({
          id: user.uid,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          numeroTelefono: '',
          operaciones: user.operaciones,
        })),
        ...membersData.membersWithOperations,
      ];
      setCombinedData(initialData);
    }
  }, [usersData, membersData]);

  // Memos
  const honorariosBrokerTotales = useMemo(() => {
    return combinedData.reduce((acc, usuario) => {
      return (
        acc +
        usuario.operaciones.reduce(
          (sum: number, op: { honorarios_broker: number }) =>
            sum + op.honorarios_broker,
          0
        )
      );
    }, 0);
  }, [combinedData]);

  const filteredAgents = useMemo(() => {
    return filterAgentsBySearch(combinedData, searchQuery, [
      'firstName',
      'lastName',
    ]);
  }, [combinedData, searchQuery]);

  const sortedData = useMemo(() => {
    const sorted = filteredAgents // Use filtered agents instead of combinedData
      .map((agent) => ({
        ...agent,
        percentage:
          calculateAdjustedBrokerFees(agent.operaciones) /
          honorariosBrokerTotales,
      }))
      .sort((a, b) => b.percentage - a.percentage);
    return sorted;
  }, [filteredAgents, honorariosBrokerTotales]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAgents = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  // Render logic
  if (isLoadingUsers || isLoadingMembers) {
    return <SkeletonLoader height={60} count={14} />;
  }
  if (usersError || membersError) {
    return (
      <p>
        Error:{' '}
        {usersError?.message ||
          membersError?.message ||
          'An unknown error occurred'}
      </p>
    );
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
      {currentAgents.length === 0 ? (
        <p className="text-center text-gray-600">No existen agentes</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`bg-lightBlue/10 ${OPERATIONS_LIST_COLORS.headerText}`}
              >
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
              {currentAgents.map((usuario, index) => (
                <tr
                  key={usuario.id}
                  className={`border-b text-center h-[75px] ${
                    currentPage === 1 && index === 0 ? 'bg-green-100' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-start w-1/5">
                    {usuario.firstName} {usuario.lastName}
                  </td>
                  <td className="py-3 px-4">
                    {usuario.operaciones.length > 0 ? (
                      <ul>
                        <li>
                          $
                          {formatNumber(
                            calculateAdjustedBrokerFees(usuario.operaciones)
                          )}
                        </li>
                      </ul>
                    ) : (
                      <span>No operations</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {usuario.operaciones.length > 0 ? (
                      <ul>
                        <li>{formatNumber(usuario.percentage * 100)}%</li>
                      </ul>
                    ) : (
                      <span>No operations</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {calculateTotalOperations(usuario.operaciones)}
                  </td>
                  <td className="py-3 px-4">
                    {calculateTotalBuyerTips(usuario.operaciones)}
                  </td>
                  <td className="py-3 px-4">
                    {calculateTotalSellerTips(usuario.operaciones)}
                  </td>
                  <td className="py-3 px-4">
                    {calculateTotalTips(usuario.operaciones)}
                  </td>
                  <td className="py-3 px-4">
                    $
                    {formatNumber(
                      calculateTotalReservationValue(usuario.operaciones)
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {usuario.id !== currentUser.uid && ( // Check if the user is not the current user
                      <>
                        <button
                          onClick={() => handleEditClick(usuario)}
                          className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteButtonClick(usuario)}
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
