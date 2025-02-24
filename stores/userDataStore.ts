import axios from 'axios';
import { create } from 'zustand';
import { getAuth } from 'firebase/auth';

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

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado en Firebase');

      const token = await user.getIdToken(); // Obtener el token antes de hacer la solicitud

      const response = await axios.get(`/api/users/${user_uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;
      if (!userData || typeof userData !== 'object') {
        throw new Error('Datos de usuario inválidos recibidos del servidor');
      }

      set({ userData, isLoading: false });
    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchUserData: async (userID: string) => {
    const { isLoading, userData } = get();
    if (isLoading || userData) return;

    set({ isLoading: true, error: null });

    try {
      if (!userID) {
        throw new Error('No hay usuario autenticado');
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado en Firebase');

      const token = await user.getIdToken(); // Obtener el token antes de hacer la solicitud

      const response = await axios.get(`/api/users/${userID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Datos de usuario inválidos recibidos del servidor');
      }

      set({ userData: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching user data:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearUserData: () => set({ userData: null, error: null }),

  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),
}));
