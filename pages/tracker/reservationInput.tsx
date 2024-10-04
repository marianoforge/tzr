import PrivateRoute from "@/components/TrackeComponents/PrivateRoute";
import PrivateLayout from "@/components/TrackeComponents/PrivateLayout";
import FormularioOperacion from "@/components/TrackeComponents/Operations/FormularioOperacion";

const ReservationInput = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <FormularioOperacion />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ReservationInput;
