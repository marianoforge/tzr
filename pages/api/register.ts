// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface RegisterRequestBody {
  email: string;
  password: string;
  comision: number;
  numero_telefono: string;
  firstName: string;
  lastName: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const {
    email,
    password,
    comision,
    numero_telefono,
    firstName,
    lastName,
  }: RegisterRequestBody = req.body;

  if (
    !email ||
    !password ||
    comision === undefined ||
    !numero_telefono ||
    !firstName ||
    !lastName
  ) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    // Crear usuario con Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Guardar información del usuario en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      name: firstName,
      lastName: lastName,
      email: user.email,
      uid: user.uid,
      createdAt: new Date(),
      comision: comision,
      numero_telefono: numero_telefono,
    });

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}
