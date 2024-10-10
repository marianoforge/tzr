// pages/success.tsx

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface SessionType {
  // Define the properties of the session object here
  userId: string;
  token: string;
  // Add other properties as needed
}

export default function Success() {
  const router = useRouter();
  const [session, setSession] = useState<SessionType | null>(null); // Replace 'SessionType' with the actual type

  useEffect(() => {
    const fetchSession = async () => {
      const sessionId = router.query.session_id;

      if (sessionId) {
        const res = await fetch(`/api/checkout_session/${sessionId}`);
        const data = await res.json();
        setSession(data);
      }
    };

    fetchSession();
  }, [router.query.session_id]);

  return (
    <div>
      <h1>¡Pago exitoso!</h1>
      {session && <pre>{JSON.stringify(session, null, 2)}</pre>}
    </div>
  );
}
