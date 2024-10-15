// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { setCsrfCookie, validateCsrfToken } from "@/lib/csrf";
import { RegisterRequestBody } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Generar y devolver el CSRF token
    const token = setCsrfCookie(res);
    return res.status(200).json({ csrfToken: token });
  }

  if (req.method === "POST") {
    // Validar el CSRF token
    const isValidCsrf = validateCsrfToken(req);
    if (!isValidCsrf) {
      return res.status(403).json({ message: "Invalid CSRF token" });
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
      uid,
      priceId,
    }: RegisterRequestBody = req.body;

    if (
      !email ||
      !agenciaBroker ||
      !numeroTelefono ||
      !firstName ||
      !lastName
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    try {
      // Si el usuario se está registrando con Google
      if (googleUser && uid) {
        await setDoc(doc(db, "usuarios", uid), {
          email,
          agenciaBroker,
          numeroTelefono,
          firstName,
          lastName,
          role,
          priceId,
          // Si no hay priceId, asignar un trial de 7 días
          ...(priceId
            ? {}
            : { trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }),
          createdAt: new Date(),
        });

        return res
          .status(201)
          .json({ message: "Usuario registrado exitosamente (Google)" });
      }

      // Si falta la contraseña para el registro con email y contraseña
      if (!password) {
        return res.status(400).json({ message: "La contraseña es requerida" });
      }

      // Registro con email y contraseña
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        email: user.email,
        agenciaBroker,
        numeroTelefono,
        firstName,
        lastName,
        role,
        priceId,
        uid: user.uid,
        createdAt: new Date(),
        // Si no hay priceId, asignar un trial de 7 días
        ...(priceId
          ? {}
          : { trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }),
      });

      return res
        .status(201)
        .json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al registrar usuario" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
