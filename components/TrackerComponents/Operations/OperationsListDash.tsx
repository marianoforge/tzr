import { useQuery } from '@tanstack/react-query';

import { fetchUserOperations } from '@/lib/api/operationsApi';
import { useAuthStore } from '@/stores/authStore';

import OperationsTable from './OperationsTable';
import OperationsContainer from './OperationsContainer';

const OperationsListDash: React.FC = () => {
  const { userID } = useAuthStore();

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
  } = useQuery({
    queryKey: ['operations', userID],
    queryFn: () => fetchUserOperations(userID || ''),
    enabled: !!userID,
  });

  return (
    <OperationsContainer
      isLoading={isLoading}
      title="Lista de Operaciones"
      operationsLength={operations.length}
      operationsError={operationsError}
    >
      <OperationsTable />
    </OperationsContainer>
  );
};

export default OperationsListDash;
