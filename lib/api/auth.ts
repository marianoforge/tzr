import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";

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
    return { message: "Inicio de sesión exitoso", user: userCredential.user };
  } catch (error) {
    console.error(error);
    throw new Error("Error al iniciar sesión con email y contraseña.");
  }
};

// Login con Google
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return {
      message: "Inicio de sesión con Google exitoso",
      user: result.user,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error al iniciar sesión con Google.");
  }
};

export const resetPassword = async (email: string) => {
  const response = await axios.post("/api/auth/reset-password", { email });
  return response.data;
};
