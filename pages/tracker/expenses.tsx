import FormularioExpenses from "@/components/TrackerComponents/Expenses/ExpensesAgent/FormExpenses";
import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";

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
