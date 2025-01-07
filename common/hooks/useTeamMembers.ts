import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useAuthStore } from '@/stores/authStore';

import { QueryKeys } from '../enums';

export const useTeamMembers = () => {
  const { userID } = useAuthStore();

  const fetchTeamMembers = async () => {
    const response = await axios.get('/api/users/teamMembers');

    const teamMembers = response.data.teamMembers.filter(
      (member: { teamLeadID: string | null }) => member.teamLeadID === userID
    );

    return teamMembers;
  };

  const query = useQuery({
    queryKey: [QueryKeys.TEAM_MEMBERS, userID],
    queryFn: fetchTeamMembers,
    enabled: !!userID,
  });

  return query;
};
