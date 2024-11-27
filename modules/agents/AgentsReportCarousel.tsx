import React, { useState, useCallback } from 'react';
import Slider from 'react-slick';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon, ServerIcon } from '@heroicons/react/24/outline';

import EditAgentsModal from './EditAgentsModal';
import { TeamMember } from './AgentsReport';

import { formatNumber } from '@/common/utils/formatNumber';
import {
  calculateAdjustedBrokerFees,
  calculateTotalOperations,
  calculateTotalBuyerTips,
  calculateTotalSellerTips,
  calculateTotalTips,
  calculateTotalReservationValue,
} from '@/common/utils/calculationsAgents';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';

// Configuración del slider
const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
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

const AgentsReportCarousel = ({ userId }: { userId: string }) => {
  const queryClient = useQueryClient();
  // All hooks should be declared at the top level
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Ensure hooks are called unconditionally before the return
  if (error instanceof Error) return <div>Error: {error.message}</div>;

  // Filter members and paginate them
  const filteredMembers =
    data?.filter((member) => {
      const fullName = `${member.firstName.toLowerCase()} ${member.lastName.toLowerCase()}`;
      const searchWords = searchQuery.toLowerCase().split(' ');
      return (
        member.teamLeadID === userId &&
        searchWords.every((word) => fullName.includes(word))
      );
    }) || [];

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const honorariosBrokerTotales = () => {
    return paginatedMembers.reduce((acc, usuario) => {
      return (
        acc +
        usuario.operations.reduce(
          (sum: number, op: { honorarios_broker: number }) =>
            sum + op.honorarios_broker,
          0
        )
      );
    }, 0);
  };
  if (isLoading) {
    return <SkeletonLoader height={60} count={14} />;
  }
  return (
    <div className="bg-white p-4 mt-20 rounded-xl shadow-md pb-10">
      <div className="flex justify-center mb-4 flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Reporte Agentes</h2>
        <input
          type="text"
          placeholder="Buscar agente por nombre o apellido..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[320px] p-2 my-4 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic text-center"
        />
      </div>
      {searchQuery && filteredMembers.length > 0 ? (
        <Slider {...settings}>
          {filteredMembers.map((usuario) => (
            <div key={usuario.id} className="p-4 expense-card">
              <div className="bg-mediumBlue mb-4 text-white p-4 rounded-xl shadow-md flex justify-center space-x-4 h-auto min-h-[300px]">
                <div className="space-y-2 sm:space-y-4 flex flex-col w-[100%]">
                  <p>
                    <strong>Nombre:</strong> {usuario.firstName}{' '}
                    {usuario.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {usuario.email}
                  </p>
                  <p>
                    <strong>Total Facturación Bruta:</strong>{' '}
                    {usuario.operations.length > 0 ? (
                      `$${formatNumber(
                        calculateAdjustedBrokerFees(usuario.operations)
                      )}`
                    ) : (
                      <span>No operations</span>
                    )}
                  </p>
                  <p>
                    <strong>Aporte a la Facturación Bruta:</strong>{' '}
                    {usuario.operations.length > 0 ? (
                      <ul>
                        <li>
                          {formatNumber(
                            (calculateAdjustedBrokerFees(usuario.operations) *
                              100) /
                              honorariosBrokerTotales()
                          )}
                          %
                        </li>
                      </ul>
                    ) : (
                      <span>No operations</span>
                    )}
                  </p>
                  <p>
                    <strong>Cantidad de Operaciones:</strong>{' '}
                    {usuario.operations.length > 0 ? (
                      calculateTotalOperations(usuario.operations)
                    ) : (
                      <span>No operations</span>
                    )}
                  </p>
                  <p>
                    <strong>Puntas Compradoras:</strong>{' '}
                    {calculateTotalBuyerTips(usuario.operations)}
                  </p>
                  <p>
                    <strong>Puntas Vendedoras:</strong>{' '}
                    {calculateTotalSellerTips(usuario.operations)}
                  </p>
                  <p>
                    <strong>Puntas Totales:</strong>{' '}
                    {calculateTotalTips(usuario.operations)}
                  </p>
                  <p>
                    <strong>Monto Total Operaciones:</strong>{' '}
                    {formatNumber(
                      calculateTotalReservationValue(usuario.operations)
                    )}
                  </p>
                  {usuario.id !== userId && (
                    <div className="flex w-full justify-center gap-8">
                      <button
                        onClick={() => handleEditClick(usuario)}
                        className="text-lightPink hover:text-lightGreen transition duration-150 ease-in-out text-sm font-semibold"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(usuario.id)}
                        className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                      >
                        <TrashIcon className="text-redAccent h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <ServerIcon className="h-12 w-12" strokeWidth={1} />
          <p className="text-center font-semibold">No hay agentes</p>
        </div>
      )}
      {isModalOpen && selectedMember && (
        <EditAgentsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          member={selectedMember}
          onSubmit={handleSubmit}
          onCloseAndUpdate={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AgentsReportCarousel;
