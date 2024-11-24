import { useQuery } from '@tanstack/react-query';

const fetchUserCurrencySymbol = async (userId: string): Promise<string> => {
  if (!userId) {
    console.error('User ID is required but not provided.');
    return '';
  }

  try {
    const response = await fetch(`/api/currency-symbol?user_uid=${userId}`);

    if (!response.ok) {
      const errorMessage = `Failed to fetch currency symbol. Status: ${response.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.currencySymbol || '';
  } catch (error) {
    console.error('Error fetching currency symbol:', error);
    throw error;
  }
};

export const useUserCurrencySymbol = (userId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userCurrencySymbol', userId],
    queryFn: () => fetchUserCurrencySymbol(userId),
    enabled: Boolean(userId),
  });

  return { currencySymbol: data || '', isLoading, error };
};
