import { useState, useEffect, useMemo, useCallback } from 'react';
import { UserData, TeamMember, UserWithOperations } from '@/types';
import useUsersWithOperations from '@/hooks/useUserWithOperations';
import { useTeamMembersOps } from '@/hooks/useTeamMembersOps';
import { calculateAdjustedBrokerFees } from '@/utils/calculationsAgents';

const useAgentsData = (currentUser: UserData) => {
  const [combinedData, setCombinedData] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useUsersWithOperations(currentUser);
  const {
    data: membersData,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useTeamMembersOps(currentUser.uid ?? '');

  useEffect(() => {
    if (usersData && membersData) {
      const initialData: TeamMember[] = [
        ...usersData.map((user: UserWithOperations) => ({
          id: user.uid,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          numeroTelefono: '',
          operaciones: user.operaciones,
        })),
        ...membersData.membersWithOperations,
      ];
      setCombinedData(initialData);
    }
  }, [usersData, membersData]);

  // Memos
  const honorariosBrokerTotales = useMemo(() => {
    return combinedData.reduce((acc, usuario) => {
      return (
        acc +
        usuario.operaciones.reduce(
          (sum: number, op: { honorarios_broker: number }) =>
            sum + op.honorarios_broker,
          0
        )
      );
    }, 0);
  }, [combinedData]);

  const filteredAgents = useMemo(() => {
    return combinedData.filter((agent) => {
      const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  }, [combinedData, searchQuery]);

  const sortedData = useMemo(() => {
    const sorted = filteredAgents
      .map((agent) => ({
        ...agent,
        percentage:
          calculateAdjustedBrokerFees(agent.operaciones) /
          honorariosBrokerTotales,
      }))
      .sort((a, b) => b.percentage - a.percentage);
    return sorted;
  }, [filteredAgents, honorariosBrokerTotales]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAgents = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  return {
    currentAgents,
    isLoading: isLoadingUsers || isLoadingMembers,
    error: usersError || membersError,
    searchQuery,
    setSearchQuery,
    currentPage,
    totalPages,
    handlePageChange,
  };
};

export default useAgentsData;
