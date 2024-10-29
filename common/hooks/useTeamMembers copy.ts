import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TeamMember, UserData } from '@/common/types/';

const useAgentsManagement = (currentUser: UserData) => {
  const queryClient = useQueryClient();

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEditClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    async (memberId: string) => {
      try {
        const response = await fetch(`/api/teamMembers/${memberId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
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

  return {
    selectedMember,
    isModalOpen,
    isDeleteModalOpen,
    setIsModalOpen,
    setIsDeleteModalOpen,
    handleEditClick,
    handleDeleteClick,
    handleSubmit,
  };
};

export default useAgentsManagement;
