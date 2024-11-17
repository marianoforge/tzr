import { signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

import { auth } from '@/lib/firebase';

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
  const response = await axios.post('/api/auth/reset-password', { email });
  return response.data;
};
