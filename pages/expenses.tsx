import FormularioExpenses from "@/components/Expenses/FormExpenses";
import PrivateLayout from "@/components/PrivateLayout";
import PrivateRoute from "@/components/PrivateRoute";

const ExpensesFormPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <FormularioExpenses />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesFormPage;
