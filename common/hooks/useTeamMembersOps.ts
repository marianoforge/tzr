import { useQuery } from '@tanstack/react-query';

import { TeamMember } from '@/common/types/';
import { useAuthStore } from '@/stores/authStore';

import { QueryKeys } from '../enums';

const fetchTeamMembers = async (
  teamLeadID: string
): Promise<{ membersWithOperations: TeamMember[] }> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await fetch(
    `/api/users/teamMemberOps?teamLeadID=${teamLeadID}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Error fetching team members: ${response.statusText}`);
  }

  return response.json();
};

export const useTeamMembersOps = (teamLeadID: string) => {
  return useQuery({
    queryKey: [QueryKeys.TEAM_MEMBERS_OPS, teamLeadID],
    queryFn: () => fetchTeamMembers(teamLeadID),
    enabled: !!teamLeadID, // Solo ejecuta la query si hay un teamLeadID
  });
};
