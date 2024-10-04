import FormularioExpenses from "@/components/TrackeComponents/Expenses/ExpensesAgent/FormExpenses";
import PrivateLayout from "@/components/TrackeComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackeComponents/PrivateRoute";

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
