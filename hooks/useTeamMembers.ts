import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore"; // Suponiendo que aquí manejas la autenticación
import axios from "axios";

export const useTeamMembers = () => {
  const { userID } = useAuthStore(); // Obtener el UID del usuario logueado

  const fetchTeamMembers = async () => {
    // Hacer la solicitud al endpoint existente
    const response = await axios.get("/api/users/teamMembers");

    // Filtrar los miembros del equipo por teamLeadID en el frontend
    const teamMembers = response.data.teamMembers.filter(
      (member: { teamLeadID: string | null }) => member.teamLeadID === userID
    );

    return teamMembers;
  };

  // Usar react-query para manejar la solicitud y el caché de los datos
  const query = useQuery({
    queryKey: ["teamMembers", userID],
    queryFn: fetchTeamMembers,
    enabled: !!userID, // Habilitar la consulta solo si hay un userID
  });

  return query;
};
