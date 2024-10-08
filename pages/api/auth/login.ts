import type { NextApiRequest, NextApiResponse } from "next";
import { loginWithEmailAndPassword, loginWithGoogle } from "@/lib/api/auth"; // Usamos las funciones refactorizadas
import { LoginRequestBody } from "@/types";
import { schema } from "@/schemas/loginFormSchema"; // Importa el esquema de validación
import { ValidationError } from "yup"; // Import the ValidationError type

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
      // Login con Google
      const response = await loginWithGoogle();
      return res
        .status(200)
        .json({ message: response.message, user: response.user });
    }

    // Validar si se pasó email y password
    if (!email || !password) {
      return res
        .status(400)
        .json({
          message: "El correo electrónico y la contraseña son requeridos.",
        });
    }

    // Login con email y contraseña
    const response = await loginWithEmailAndPassword(email, password);
    return res
      .status(200)
      .json({ message: response.message, user: response.user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error al iniciar sesión:", error.message);
    } else {
      console.error("Error al iniciar sesión:", error);
    }

    // Si la validación de los datos falla
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: "Error de validación",
        errors: error.errors, // Retorna los errores de validación
      });
    } else {
      // Handle other types of errors if necessary
      return res.status(401).json({
        message: "Error al iniciar sesión, verifica tus credenciales.",
      });
    }
  }
}
