import type { NextApiRequest, NextApiResponse } from "next";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

interface RegisterRequestBody {
  email: string;
  password?: string; // Hacemos que la contraseña sea opcional si es un usuario de Google
  agenciaBroker: string;
  numeroTelefono: string;
  firstName: string;
  lastName: string;
  role: string;
  googleUser?: boolean; // Indicador si es un usuario de Google
  uid?: string; // uid para usuarios de Google
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
    agenciaBroker,
    numeroTelefono,
    firstName,
    lastName,
    role,
    googleUser,
    uid, // Asegúrate de que el uid sea parte del payload
  }: RegisterRequestBody = req.body;

  if (!email || !agenciaBroker || !numeroTelefono || !firstName || !lastName) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    // Si el usuario proviene de Google (sin contraseña)
    if (googleUser && uid) {
      // Usamos el UID proporcionado por Firebase
      await setDoc(doc(db, "usuarios", uid), {
        email,
        agenciaBroker,
        numeroTelefono,
        firstName,
        lastName,
        role,
        uid, // Asegúrate de guardar el uid en el documento
        createdAt: new Date(),
      });
      return res
        .status(201)
        .json({ message: "Usuario registrado exitosamente (Google)" });
    }

    // Si no es un usuario de Google, entonces necesitamos crear el usuario con contraseña
    if (!password) {
      return res.status(400).json({ message: "Contraseña es requerida" });
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Guardar el documento con el UID proporcionado por Firebase para usuarios con email y contraseña
    await setDoc(doc(db, "usuarios", user.uid), {
      email: user.email,
      agenciaBroker,
      numeroTelefono,
      firstName,
      lastName,
      role,
      uid: user.uid, // Guardamos el UID para usuarios con email/contraseña
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch {
    res.status(500).json({ message: "Error al registrar usuario" });
  }
}
