import type { NextApiRequest, NextApiResponse } from "next";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LoginRequestBody } from "@/types";
import { schema } from "@/schemas/loginFormSchema"; // Importa el esquema

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { email, password, googleAuth }: LoginRequestBody = req.body;

  try {
    // Validar los datos del cuerpo de la solicitud
    await schema.validate(req.body, { abortEarly: false });

    if (googleAuth) {
      // Handle Google OAuth
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return res
        .status(200)
        .json({ message: "Inicio de sesión con Google exitoso" });
    }

    // Ensure email and password are defined
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Handle Email/Password Login
    await signInWithEmailAndPassword(auth, email, password);
    return res.status(200).json({ message: "Inicio de sesión exitoso" });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    const validationError = {
      name: "ValidationError",
      errors: [], // Ensure this property exists and is initialized
    };

    if (validationError.name === "ValidationError") {
      return res.status(400).json({
        message: "Error de validación",
        errors: validationError.errors,
      });
    }
    return res.status(401).json({
      message: "Error al iniciar sesión, verifica tus credenciales.",
    });
  }
}
