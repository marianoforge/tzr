import axios from 'axios';
import { create } from 'zustand';

import { UserDataState, UserData } from '@/common/types/';

export const useUserDataStore = create<UserDataState>((set, get) => ({
  items: [],
  userData: null,
  isLoading: false,
  error: null,
  role: null,

  setItems: (items: UserData[]) => set({ items }),

  setUserData: (userData: UserData | null) => set({ userData }),

  setUserRole: (role: string | null) => set({ role }),

  fetchItems: async (user_uid: string) => {
    const { isLoading, userData } = get();

    if (isLoading || userData) return;

    set({ isLoading: true, error: null });

    try {
      if (!user_uid) {
        throw new Error('No hay usuario autenticado');
      }

      const response = await axios(`/api/users/${user_uid}`);

      if (response.status !== 200) {
        const errorText = await response.data;
        console.error('Error response:', errorText);
        throw new Error(
          `Error al obtener los datos del usuario: ${response.status} ${response.statusText}`
        );
      }

      const userData = response.data;

      if (!userData || typeof userData !== 'object') {
        throw new Error('Datos de usuario inválidos recibidos del servidor');
      }

      const validatedUserData: UserData = {
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        email: userData.email || null,
        numeroTelefono: userData.numeroTelefono || null,
        agenciaBroker: userData.agenciaBroker || null,
        objetivoAnual: userData.objetivoAnual || null,
        role: userData.role || null,
        uid: userData.uid || null,
        trialEndsAt: userData.trialEndsAt || null,
        stripeCustomerId: userData.stripeCustomerId || null,
        stripeSubscriptionId: userData.stripeSubscriptionId || null,
      };

      set({ userData: validatedUserData, isLoading: false });
    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearUserData: () => set({ userData: null, error: null }),

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),
  fetchUserData: async (userID: string) => {
    const { isLoading, userData } = get();

    if (isLoading || userData) return;

    set({ isLoading: true, error: null });

    try {
      if (!userID) {
        throw new Error('No hay usuario autenticado');
      }

      const response = await axios(`/api/users/${userID}`);

      if (response.status !== 200) {
        const errorText = await response.data;
        console.error('Error response:', errorText);
        throw new Error(
          `Error al obtener los datos del usuario: ${response.status} ${response.statusText}`
        );
      }

      const userData = response.data;

      if (!userData || typeof userData !== 'object') {
        throw new Error('Datos de usuario inválidos recibidos del servidor');
      }

      set({ userData: userData, isLoading: false });
    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
