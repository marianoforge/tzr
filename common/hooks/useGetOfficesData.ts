import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useAuthStore } from '@/stores/authStore';

// Definimos una enumeración para las claves de consulta
export enum OfficeAdminQueryKeys {
  OFFICES_DATA = 'officesData',
}

// Función para obtener los datos de oficinas desde la API
const fetchOfficesData = async () => {
  const token = await useAuthStore.getState().getAuthToken();

  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await axios.get('/api/officeAdmin/getOfficesData', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.operations;
};

export const useGetOfficesData = () => {
  const { userID } = useAuthStore();

  const {
    data: officeOperations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [OfficeAdminQueryKeys.OFFICES_DATA],
    queryFn: fetchOfficesData,
    enabled: !!userID, // Solo ejecutar si hay un usuario autenticado
  });

  return {
    officeOperations,
    isLoading,
    error,
    refetch,
  };
};
