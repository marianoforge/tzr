import PrivateRoute from "@/components/TrackeComponents/PrivateRoute";
import PrivateLayout from "@/components/TrackeComponents/PrivateLayout";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import BigCalendar from "@/components/TrackeComponents/BigCalendar";

const ReservationInput = () => {
  const { userID, initializeAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe();
  }, [initializeAuthListener]);

  if (!userID) {
    return <p>Loading user information...</p>; // Optional loading state or redirect
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
