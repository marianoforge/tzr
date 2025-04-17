import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useAuthStore } from '@/stores/authStore';
import { Operation } from '@/common/types';

// Definimos una enumeración para las claves de consulta
export enum OfficeAdminQueryKeys {
  OFFICES_DATA = 'officesData',
}

// Interfaz para los datos de oficinas
export interface OfficeData {
  [key: string]: {
    office: string;
    [key: string]: unknown;
  };
}

// Interfaz para los datos retornados por la API
interface OfficesApiResponse {
  operations: Operation[];
  offices: OfficeData;
}

// Función para obtener los datos de oficinas desde la API
const fetchOfficesData = async (): Promise<OfficesApiResponse> => {
  const token = await useAuthStore.getState().getAuthToken();

  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await axios.get('/api/officeAdmin/getOfficesData', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    operations: response.data.operations || [],
    offices: response.data.offices || {},
  };
};

export const useGetOfficesData = () => {
  const { userID } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [OfficeAdminQueryKeys.OFFICES_DATA],
    queryFn: fetchOfficesData,
    enabled: !!userID, // Solo ejecutar si hay un usuario autenticado
  });

  return {
    officeOperations: data?.operations || [],
    officeData: data?.offices || {},
    isLoading,
    error,
    refetch,
  };
};
