import { useEffect } from 'react';

import PrivateRoute from '@/components/TrackerComponents/PrivateRoute';
import PrivateLayout from '@/components/TrackerComponents/PrivateLayout';
import FormularioEvento from '@/components/TrackerComponents/Events/FormularioEvento';
import { useAuthStore } from '@/stores/authStore';

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
        <FormularioEvento />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ReservationInput;
