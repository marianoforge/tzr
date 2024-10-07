import type { NextApiRequest, NextApiResponse } from "next";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { setCsrfCookie, validateCsrfToken } from "@/lib/csrf";
import { RegisterRequestBody } from "@/types";
import { createSchema } from "@/schemas/registerFormSchema"; // Importa el esquema

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = setCsrfCookie(res);
    return res.status(200).json({ csrfToken: token });
  }

  if (req.method === "POST") {
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
      // Validar los datos del cuerpo de la solicitud
      const schema = createSchema(googleUser ?? false);
      await schema.validate(req.body, { abortEarly: false });

      if (googleUser && uid) {
        await setDoc(doc(db, "usuarios", uid), {
          email,
          agenciaBroker,
          numeroTelefono,
          firstName,
          lastName,
          role,
          uid,
          createdAt: new Date(),
        });
        return res
          .status(201)
          .json({ message: "Usuario registrado exitosamente (Google)" });
      }

      if (!password) {
        return res.status(400).json({ message: "Contraseña es requerida" });
      }

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
        uid: user.uid,
        createdAt: new Date(),
      });

      return res
        .status(201)
        .json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al registrar usuario" });
    }
  } else {
    res.status(405).json({ message: "Método no permitido" });
  }
}
