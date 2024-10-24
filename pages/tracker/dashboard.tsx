import { getDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Dashboard from '@/components/TrackerComponents/Dashboard';
import PrivateLayout from '@/components/TrackerComponents/PrivateLayout';
import PrivateRoute from '@/components/TrackerComponents/PrivateRoute';
import { auth, db } from '@/lib/firebase';

const DashboardPage = () => {
  const [trialExpired, setTrialExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkTrialStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        const userData = userDoc.data();

        if (userData && userData.trialEndsAt) {
          // Verificamos si trialEndsAt es un objeto Date o un Timestamp de Firestore
          let trialEndDate;

          if (userData.trialEndsAt.toDate) {
            // Si es un Timestamp de Firestore, usamos toDate()
            trialEndDate = userData.trialEndsAt.toDate();
          } else {
            // Si es un objeto Date nativo, lo usamos directamente
            trialEndDate = new Date(userData.trialEndsAt);
          }

          if (Date.now() > trialEndDate.getTime()) {
            setTrialExpired(true);
          }
        }
      }
    };

    checkTrialStatus();
  }, []);

  if (trialExpired) {
    router.push('/trial-expired');
    return null;
  }

  return (
    <PrivateRoute>
      <PrivateLayout>
        <Dashboard />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default DashboardPage;
