import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '../enums';

import { TeamMember } from '@/common/types/';

const fetchTeamMembers = async (
  teamLeadID: string
): Promise<{ membersWithOperations: TeamMember[] }> => {
  const response = await fetch(
    `/api/users/teamMemberOps?teamLeadID=${teamLeadID}`
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
