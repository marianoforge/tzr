// components/PrivateRoute.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuthStore } from "@/stores/authStore";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const router = useRouter();
  const { userID, setUserID } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserID(user.uid);
      } else {
        setUserID(null);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router, setUserID]);

  if (!userID) {
    return;
  }

  return <>{children}</>;
};

export default PrivateRoute;
