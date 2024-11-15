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
    enabled: !!input,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
