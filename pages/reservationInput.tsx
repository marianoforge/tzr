import PrivateRoute from "../components/PrivateRoute";
import PrivateLayout from "../components/PrivateLayout";
import FormularioOperacion from "../components/Operations/FormularioOperacion";

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
