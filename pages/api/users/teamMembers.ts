import type { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs, addDoc } from "firebase/firestore"; // Importa addDoc para generar ID automáticamente
import * as yup from "yup";
import { db } from "@/lib/firebase";
import { setCsrfCookie, validateCsrfToken } from "@/lib/csrf";
import { TeamMemberRequestBody } from "@/types";

export const teamMemberSchema = yup.object().shape({
  firstName: yup.string().required("Nombre es requerido"),
  lastName: yup.string().required("Apellido es requerido"),
  email: yup.string().email("Correo inválido").nullable(),
  numeroTelefono: yup.string().nullable(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Manejo del método GET para obtener todos los miembros del equipo y enviar el CSRF token
  if (req.method === "GET") {
    try {
      // Generar y establecer el token CSRF en una cookie
      const token = setCsrfCookie(res);

      // Obtener todos los miembros del equipo desde Firestore
      const teamCollection = collection(db, "teams");
      const teamSnapshot = await getDocs(teamCollection);
      const teamMembers = teamSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Devolver los miembros del equipo junto con el CSRF token
      return res.status(200).json({ csrfToken: token, teamMembers });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Error al obtener los miembros del equipo" });
    }
  }

  // Manejo del método POST para agregar un nuevo miembro del equipo
  if (req.method === "POST") {
    const isValidCsrf = validateCsrfToken(req);
    if (!isValidCsrf) {
      return res.status(403).json({ message: "Invalid CSRF token" });
    }

    const {
      email,
      numeroTelefono,
      firstName,
      lastName,
    }: TeamMemberRequestBody = req.body;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    try {
      // Valida los datos usando el esquema correcto
      await teamMemberSchema.validate(req.body, { abortEarly: false });

      // Generar un nuevo documento con un ID único automáticamente
      const newMemberRef = await addDoc(collection(db, "teams"), {
        email,
        numeroTelefono,
        firstName,
        lastName,
        teamLeadID: req.body.uid, // Asignar el uid del Team Lead que lo registró
        createdAt: new Date(),
      });

      return res.status(201).json({
        message: "Usuario registrado exitosamente",
        id: newMemberRef.id,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al registrar usuario" });
    }
  } else {
    return res.status(405).json({ message: "Método no permitido" });
  }
}
