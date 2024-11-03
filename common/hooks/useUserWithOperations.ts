import { useQuery } from '@tanstack/react-query';

import { Operation, UserData } from '@/common/types/';
import { QueryKeys, UserRole } from '../enums';

interface UserWithOperations {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  agenciaBroker?: string;
  operaciones: Operation[];
}

export const fetchUsersWithOperations = async (
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

  if (user.role === UserRole.TEAM_LEADER_BROKER) {
    return usersWithOperations.filter(
      (usuario: UserWithOperations) => usuario.uid === user.uid
    );
  }

  return usersWithOperations;
};

const useUsersWithOperations = (user: UserData) => {
  return useQuery({
    queryKey: [QueryKeys.USERS_WITH_OPERATIONS, user],
    queryFn: () => fetchUsersWithOperations(user),
  });
};

export default useUsersWithOperations;
