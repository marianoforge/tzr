import { useQuery } from '@tanstack/react-query';

import { Operation, UserData } from '@/types';

interface UserWithOperations {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  agenciaBroker?: string;
  operaciones: Operation[];
}

const fetchUsersWithOperations = async (
  user: UserData
): Promise<UserWithOperations[]> => {
  const response = await fetch('/api/users/usersWithOps', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users and operations');
  }

  const { usersWithOperations } = await response.json();

  if (user.role === 'team_leader_broker') {
    return usersWithOperations.filter(
      (usuario: UserWithOperations) => usuario.uid === user.uid
    );
  }

  return usersWithOperations;
};

const useUsersWithOperations = (user: UserData) => {
  return useQuery({
    queryKey: ['usersWithOperations', user],
    queryFn: () => fetchUsersWithOperations(user),
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
};

export default useUsersWithOperations;
