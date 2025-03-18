import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { useAuthStore } from '@/stores/authStore';

// Definimos la interfaz para los datos de proyección
export interface ProjectionData {
  ticketPromedio: number;
  promedioHonorariosNetos: number;
  efectividad: number;
  semanasDelAno: number;
  objetivoHonorariosAnuales: number;
  volumenAFacturar: number;
  totalPuntasCierres: number;
  totalPuntasCierresAnuales: number;
  totalPuntasCierresSemanales: number;
}

export const useProjectionData = () => {
  const queryClient = useQueryClient();
  const { userID } = useAuthStore();

  // Mutación para guardar los datos de proyección
  const saveProjection = useMutation({
    mutationFn: async (data: ProjectionData) => {
      // Obtener el token de autenticación
      const token = await useAuthStore.getState().getAuthToken();

      // Llamar a la API para guardar los datos
      const response = await axios.post(
        '/api/projections/saveProjection',
        {
          userID: userID,
          data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      // Invalidar consultas relacionadas para forzar una recarga de datos
      queryClient.invalidateQueries({ queryKey: ['projections', userID] });
    },
  });

  // Función para cargar los datos de proyección
  const loadProjection = useQuery({
    queryKey: ['projections', userID],
    queryFn: async () => {
      if (!userID) return null;

      const token = await useAuthStore.getState().getAuthToken();
      const response = await axios.get(
        `/api/projections/getProjection?userID=${userID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If data doesn't exist, return default values
      if (response.data && response.data.exists === false) {
        return {
          ticketPromedio: 75000,
          promedioHonorariosNetos: 3,
          efectividad: 15,
          semanasDelAno: 52,
          objetivoHonorariosAnuales: 0,
          volumenAFacturar: 0,
          totalPuntasCierres: 0,
          totalPuntasCierresAnuales: 0,
          totalPuntasCierresSemanales: 0,
        };
      }

      return response.data;
    },
    enabled: !!userID,
  });

  return {
    saveProjection,
    loadProjection,
  };
};
