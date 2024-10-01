import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";

// Inicializar Firebase solo si no está inicializado
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(
        /\\n/g,
        "\n"
      ),
    }),
  });
}

const db = getFirestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const usuariosSnapshot = await db.collection("usuarios").get();
      const usuariosConOperaciones = [];

      for (const doc of usuariosSnapshot.docs) {
        const usuarioData = doc.data();
        const operationsSnapshot = await db
          .collection("operations")
          .where("user_uid", "==", usuarioData.uid)
          .get();

        const operaciones = operationsSnapshot.docs.map((opDoc) =>
          opDoc.data()
        );

        usuariosConOperaciones.push({
          ...usuarioData,
          operaciones: operaciones,
        });
      }

      return res.status(200).json(usuariosConOperaciones);
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching data:", error.message);
      console.error("Stack trace:", error.stack); // Muestra la traza del error
    } else {
      console.error("Unexpected error:", error);
    }
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
  }
}
