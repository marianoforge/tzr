// hooks/usePlacesAutocomplete.ts
import { useQuery } from '@tanstack/react-query';

const fetchAutocompleteSuggestions = async (input: string) => {
  const response = await fetch(
    `/api/places/autocomplete?input=${encodeURIComponent(input)}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch autocomplete suggestions');
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.predictions;
};

export const usePlacesAutocomplete = (input: string) => {
  return useQuery({
    queryKey: ['places-autocomplete', input],
    queryFn: () => fetchAutocompleteSuggestions(input),
    enabled: !!input, // Only fetch if input is not empty
    staleTime: 60 * 1000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });
};
