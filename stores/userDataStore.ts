import axios from "axios";
import { create } from "zustand";

export interface UserData {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  numeroTelefono: string | null;
  agenciaBroker: string | null;
  role: string | null;
}

interface UserDataState {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  role: string | null;
  setUserData: (userData: UserData | null) => void;
  fetchUserData: (user_uid: string) => Promise<void>;
  clearUserData: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserDataStore = create<UserDataState>((set, get) => ({
  userData: null,
  isLoading: false,
  error: null,
  role: null,
  setUserData: (userData) => set({ userData }),
  setRole: (role: string | null) => set({ role }),
  fetchUserData: async (user_uid: string) => {
    const { isLoading, userData } = get();

    if (isLoading || userData) return;

    set({ isLoading: true, error: null });

    try {
      if (!user_uid) {
        throw new Error("No hay usuario autenticado");
      }

      const response = await axios(`/api/users/${user_uid}`);

      if (response.status !== 200) {
        const errorText = await response.data;
        console.error("Error response:", errorText);
        throw new Error(
          `Error al obtener los datos del usuario: ${response.status} ${response.statusText}`
        );
      }

      const userData = response.data;

      if (!userData || typeof userData !== "object") {
        throw new Error("Datos de usuario inválidos recibidos del servidor");
      }

      const validatedUserData = {
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        email: userData.email || null,
        numeroTelefono: userData.numeroTelefono || null,
        agenciaBroker: userData.agenciaBroker || null,
        role: userData.role || null, // Ensure 'role' is included
      };

      set({ userData: validatedUserData, isLoading: false });
    } catch (error) {
      console.error("Error fetching user data:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  clearUserData: () => set({ userData: null, error: null }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
