import { Operation, UserData } from "@/types";
import { useState, useEffect } from "react";

interface UserWithOperations {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  agenciaBroker?: string;
  operaciones: Operation[];
}

const useUsersWithOperations = (
  user: UserData
): { data: UserWithOperations[]; loading: boolean; error: string | null } => {
  const [data, setData] = useState<UserWithOperations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Llamar al endpoint de usuarios con operaciones
        const response = await fetch("/api/usersWithOps");
        if (!response.ok) {
          throw new Error("Failed to fetch users and operations");
        }
        const result: UserWithOperations[] = await response.json();

        console.log(data);

        if (user.role === "team_leader_broker") {
          const filteredData = result.filter(
            (usuario) => usuario.agenciaBroker === user.agenciaBroker
          );
          setData(filteredData);
        } else {
          // Si no es admin, probablemente no necesites hacer nada o devolver datos sin filtrar
          setData(result);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // El hook se ejecutará cuando cambie el `user`

  return { data, loading, error };
};

export default useUsersWithOperations;
