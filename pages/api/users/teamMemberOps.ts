import type { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Asegúrate de que este importa correctamente tu instancia de Firestore
import { setCsrfCookie } from "@/lib/csrf"; // Asegúrate de tener configurado el CSRF correctamente

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      // Set CSRF token cookie
      const token = setCsrfCookie(res);

      // Obtener el teamLeadID desde el query de la request
      const { teamLeadID } = req.query;
      if (!teamLeadID) {
        return res.status(400).json({ message: "teamLeadID es requerido" });
      }

      // Obtener los miembros del equipo desde la colección 'teams' usando el teamLeadID
      const teamsQuery = query(
        collection(db, "teams"),
        where("teamLeadID", "==", teamLeadID)
      );
      const teamsSnapshot = await getDocs(teamsQuery);

      const teamMembers = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Obtener las operaciones para cada miembro del equipo
      const membersWithOperations = await Promise.all(
        teamMembers.map(async (member) => {
          const operationsQuery = query(
            collection(db, "operations"),
            where("user_uid", "==", member.id)
          );
          const operationsSnapshot = await getDocs(operationsQuery);

          const operaciones = operationsSnapshot.docs.map((opDoc) =>
            opDoc.data()
          );
          return { ...member, operaciones };
        })
      );

      // Devolver los miembros del equipo junto con sus operaciones
      return res.status(200).json({ csrfToken: token, membersWithOperations });
    } catch (error) {
      console.error("Error fetching team members and operations:", error);
      return res
        .status(500)
        .json({ message: "Error fetching team members and operations" });
    }
  }

  // Return 405 for unsupported methods
  return res.status(405).json({ message: "Method not allowed" });
}
