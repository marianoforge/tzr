import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';

import Loader from './Loader';

import { useAuthStore } from '@/stores/authStore';
import { useUserDataStore } from '@/stores/userDataStore';
import { auth } from '@/lib/firebase';
import { PATHS } from '@/common/enums';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRole,
}) => {
  const router = useRouter();
  const { userID, setUserID, setUserRole } = useAuthStore();
  const { fetchUserData, userData, isLoading } = useUserDataStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserID(user.uid);
        await fetchUserData(user.uid);
        setUserRole(userData?.role || null);
      } else {
        setUserID(null);
        setUserRole(null);
        router.push(PATHS.LOGIN);
      }
    });

    return () => unsubscribe();
  }, [router, setUserID, setUserRole, fetchUserData, userData]);

  useEffect(() => {
    if (userID && requiredRole && userData && !isLoading) {
      if (userData?.role !== requiredRole) {
        router.push(PATHS.NOT_AUTHORIZED);
      }
    }
  }, [userID, userData, requiredRole, isLoading, router]);

  if (!userID || (requiredRole && userData?.role !== requiredRole)) {
    return isLoading ? (
      <div>
        <Loader />
      </div>
    ) : null;
  }

  return <>{children}</>;
};

export default PrivateRoute;
