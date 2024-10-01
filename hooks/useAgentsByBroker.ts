import { useState, useEffect } from "react";
import axios from "axios";

const useAgentsByBroker = (agenciaBroker: string) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get(`/api/users/agenciaBroker`, {
          params: { agenciaBroker },
        });
        setAgents(response.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [agenciaBroker]);

  return { agents, loading, error };
};

export default useAgentsByBroker;
