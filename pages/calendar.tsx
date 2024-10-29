import { useEffect } from 'react';

import PrivateRoute from '@/components/TrackerComponents/PrivateRoute';
import PrivateLayout from '@/components/TrackerComponents/PrivateLayout';
import { useAuthStore } from '@/stores/authStore';
import BigCalendar from '@/components/TrackerComponents/Events/BigCalendar';

const ReservationInput = () => {
  const { userID, initializeAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe();
  }, [initializeAuthListener]);

  if (!userID) {
    return <p>Loading user information...</p>;
  }

  return (
    <PrivateRoute>
      <PrivateLayout>
        <BigCalendar />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ReservationInput;
