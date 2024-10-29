import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmitHandler } from 'react-hook-form';

import { createEvent } from '@/lib/api/eventsApi';
import { EventFormData } from '@/common/types/';
import { useAuthStore } from '@/stores/authStore';

export const useEventMutation = (reset: () => void) => {
  const { userID } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', userID] });
      setModalMessage('Evento guardado exitosamente');
      setIsModalOpen(true);
      reset();
    },
    onError: () => {
      setModalMessage('Error al agendar el evento');
      setIsModalOpen(true);
    },
  });

  const onSubmit: SubmitHandler<EventFormData> = useCallback(
    async (data) => {
      if (!userID) {
        setModalMessage('No se proporcionó un ID de usuario válido');
        setIsModalOpen(true);
        return;
      }

      const eventData = {
        ...data,
        user_uid: userID,
      };

      mutation.mutate(eventData);
    },
    [userID, mutation]
  );

  const closeModal = () => setIsModalOpen(false);
  const acceptModal = () => router.push('/dashboard');

  return {
    isModalOpen,
    modalMessage,
    onSubmit,
    closeModal,
    acceptModal,
  };
};
