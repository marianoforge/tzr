import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Slider from 'react-slick';
import { useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

import { TeamMember, UserData, UserWithOperations } from '@/types';
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

import Loader from '../Loader';

import EditAgentsModal from './EditAgentsModal';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Configuración del slider
const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
};

const AgentsReportCarousel = ({ currentUser }: { currentUser: UserData }) => {
  const queryClient = useQueryClient();

  // Usa Tanstack Query para obtener los datos de usuarios con operaciones
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

  const [combinedData, setCombinedData] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combina los datos de usersData y membersData
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

  // Eliminar un miembro
  const handleDeleteClick = useCallback(
    async (memberId: string) => {
      if (
        window.confirm('¿Estás seguro de que deseas eliminar este miembro?')
      ) {
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
      }
    },
    [queryClient, currentUser.uid]
  );

  // Editar un miembro
  const handleEditClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  }, []);

  // Guardar los cambios del miembro editado
  const handleSubmit = async (updatedMember: TeamMember) => {
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
  };

  // Calcular honorarios totales
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

  if (isLoadingUsers || isLoadingMembers) {
    return <Loader />;
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
    <>
      <Slider {...settings}>
        {combinedData.map((usuario) => (
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
                  {usuario.operaciones.length > 0 ? (
                    `$${formatNumber(
                      calculateAdjustedBrokerFees(usuario.operaciones)
                    )}`
                  ) : (
                    <span>No operations</span>
                  )}
                </p>
                <p>
                  <strong>Aporte a la Facturación Bruta:</strong>{' '}
                  {usuario.operaciones.length > 0 ? (
                    <ul>
                      <li>
                        {formatNumber(
                          (calculateAdjustedBrokerFees(usuario.operaciones) *
                            100) /
                            honorariosBrokerTotales
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
                  {usuario.operaciones.length > 0 ? (
                    calculateTotalOperations(usuario.operaciones)
                  ) : (
                    <span>No operations</span>
                  )}
                </p>
                <p>
                  <strong>Puntas Compradoras:</strong>{' '}
                  {calculateTotalBuyerTips(usuario.operaciones)}
                </p>
                <p>
                  <strong>Puntas Vendedoras:</strong>{' '}
                  {calculateTotalSellerTips(usuario.operaciones)}
                </p>
                <p>
                  <strong>Puntas Totales:</strong>{' '}
                  {calculateTotalTips(usuario.operaciones)}
                </p>
                <p>
                  <strong>Monto Total Operaciones:</strong>{' '}
                  {formatNumber(
                    calculateTotalReservationValue(usuario.operaciones)
                  )}
                </p>
                {/* Botones de acción (Editar y Eliminar) */}
                {usersData?.some(
                  (user: UserWithOperations) => user.uid === usuario.id
                ) ? null : (
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

      {isModalOpen && selectedMember && (
        <EditAgentsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          member={selectedMember}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default AgentsReportCarousel;
