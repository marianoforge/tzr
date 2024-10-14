import { TeamMember } from "@/types";
import { useState, useEffect } from "react";

type UseTeamMembersResult = {
  members: TeamMember[] | null;
  isLoading: boolean;
  error: string | null;
};

export const useTeamMembersOps = (teamLeadID: string): UseTeamMembersResult => {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/users/teamMemberOps?teamLeadID=${teamLeadID}`
        );
        if (!response.ok) {
          throw new Error(
            `Error fetching team members: ${response.statusText}`
          );
        }

        const data = await response.json();
        setMembers(data.membersWithOperations);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (teamLeadID) {
      fetchTeamMembers();
    }
  }, [teamLeadID]);

  return { members, isLoading, error };
};
