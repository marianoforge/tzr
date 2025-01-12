import { useQuery } from '@tanstack/react-query';

import { fetchAgentExpenses } from '@/lib/api/agentExpensesApi';
import { QueryKeys } from '@/common/enums';

const useFetchUserExpenses = (teamMemberIds: string[] | null) => {
  const idsString = teamMemberIds?.filter(Boolean).join(',');

  return useQuery({
    queryKey: [QueryKeys.EXPENSES, idsString],
    queryFn: () => fetchAgentExpenses(idsString || ''),
    enabled: !!idsString,
  });
};

export default useFetchUserExpenses;
