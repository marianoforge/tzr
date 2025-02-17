import { signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';

// Login con email y contraseña
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { message: 'Inicio de sesión exitoso', user: userCredential.user };
  } catch (error) {
    console.error(error);
    throw new Error('Error al iniciar sesión con email y contraseña.');
  }
};

export const resetPassword = async (email: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.post(
    '/api/auth/reset-password',
    { email },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
