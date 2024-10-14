import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";
import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import OperationsForm from "@/components/TrackerComponents/Operations/OperationsForm";
import { useUserDataStore } from "@/stores/userDataStore";

const ReservationInput = () => {
  const { userData } = useUserDataStore();

  return (
    <PrivateRoute>
      <PrivateLayout>{userData && <OperationsForm />}</PrivateLayout>
    </PrivateRoute>
  );
};

export default ReservationInput;
