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

        // Fetch the data from the new endpoint
        const response = await fetch("/api/users/usersWithOps", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users and operations");
        }

        // Assuming response contains the CSRF token along with user data
        const {
          csrfToken,
          usersWithOperations,
        }: { csrfToken: string; usersWithOperations: UserWithOperations[] } =
          await response.json();

        // Optional: If needed, handle CSRF token (e.g., save it in cookies/localStorage)
        // This is just an example, you might use the CSRF token in subsequent requests.
        console.log("Received CSRF token:", csrfToken);

        // Filter data if the user is a team leader
        if (user.role === "team_leader_broker") {
          const filteredData = usersWithOperations.filter(
            (usuario) => usuario.uid === user.uid
          );
          setData(filteredData);
        } else {
          setData(usersWithOperations);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { data, loading, error };
};

export default useUsersWithOperations;
