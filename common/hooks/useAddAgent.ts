import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';
import { TeamMemberRequestBody } from '@/common/types/';

const useAddAgent = (onSuccessCallback: () => void) => {
  const { userID } = useAuthStore();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/users/teamMembers', {
          method: 'GET',
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  const mutation = useMutation<unknown, Error, TeamMemberRequestBody>({
    mutationFn: async (data: TeamMemberRequestBody) => {
      if (!userID) {
        throw new Error('El UID del usuario es requerido');
      }

      if (!csrfToken) {
        throw new Error('CSRF token is not available');
      }

      const response = await fetch('/api/users/teamMembers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          uid: userID,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar usuario');
      }

      return response.json();
    },
    onSuccess: () => {
      onSuccessCallback();
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('An unknown error occurred');
      }
    },
  });

  const addUser = useCallback(
    (data: TeamMemberRequestBody) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  return {
    addUser,
    formError,
    isLoading: mutation.isPending,
  };
};

export default useAddAgent;
