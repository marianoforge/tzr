import type { NextApiRequest, NextApiResponse } from "next";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

interface LoginRequestBody {
  email: string;
  password: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { email, password }: LoginRequestBody = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Correo y contraseña son requeridos" });
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    res.status(200).json({ message: "Inicio de sesión exitoso" });
  } catch {
    res
      .status(401)
      .json({ message: "Error al iniciar sesión, verifica tus credenciales." });
  }
}
