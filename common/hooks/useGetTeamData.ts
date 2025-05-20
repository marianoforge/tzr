import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { Operation } from '@/common/types';
import { useAuthStore } from '@/stores/authStore';

import { QueryKeys } from '../enums';

interface TeamMember {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  numeroTelefono?: string;
  teamLeadID?: string;
  [key: string]: string | number | boolean | undefined;
}

interface TeamData {
  teamMembers: TeamMember[];
  operations: Operation[];
}

export const useGetTeamData = () => {
  const { userID } = useAuthStore();

  const fetchTeamData = async (): Promise<TeamData> => {
    const token = await useAuthStore.getState().getAuthToken();
    if (!token) throw new Error('User not authenticated');

    const response = await axios.get('/api/teamAdmin/getTeamData', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  };

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [QueryKeys.TEAM_DATA, userID],
    queryFn: fetchTeamData,
    enabled: !!userID,
  });

  return {
    teamMembers: data?.teamMembers || [],
    teamOperations: data?.operations || [],
    isLoading,
    error,
    refetch,
  };
};
