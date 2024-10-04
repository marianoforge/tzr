import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";
import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import OperationsForm from "@/components/TrackerComponents/Operations/OperationsForm";

const ReservationInput = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <OperationsForm />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ReservationInput;
