import ExpensesList from "@/components/Expenses/ExpensesList";
import PrivateLayout from "@/components/PrivateLayout";
import PrivateRoute from "@/components/PrivateRoute";

const ExpensesFormPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <ExpensesList />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesFormPage;
