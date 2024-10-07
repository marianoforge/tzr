import type { NextApiRequest, NextApiResponse } from "next";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

interface LoginRequestBody {
  email?: string;
  password?: string;
  googleAuth?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { email, password, googleAuth }: LoginRequestBody = req.body;

  try {
    if (googleAuth) {
      // Handle Google OAuth
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return res
        .status(200)
        .json({ message: "Inicio de sesión con Google exitoso" });
    }

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Correo y contraseña son requeridos" });
    }

    // Handle Email/Password Login
    await signInWithEmailAndPassword(auth, email, password);
    return res.status(200).json({ message: "Inicio de sesión exitoso" });
  } catch {
    return res.status(401).json({
      message: "Error al iniciar sesión, verifica tus credenciales.",
    });
  }
}
