import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

const fetchUserCurrencySymbol = async (userId: string): Promise<string> => {
  if (!userId) {
    console.error('User ID is required but not provided.');
    return '';
  }

  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await fetch(`/api/currency-symbol?user_uid=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorMessage = `Failed to fetch currency symbol. Status: ${response.status}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.currencySymbol || '';
};

export const useUserCurrencySymbol = (userId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userCurrencySymbol', userId],
    queryFn: () => fetchUserCurrencySymbol(userId),
    enabled: Boolean(userId),
  });

  return { currencySymbol: data || '', isLoading, error };
};
