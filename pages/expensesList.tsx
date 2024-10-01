import { useEffect } from "react";
import { useExpensesStore } from "@/stores/useExpensesStore";
import ExpensesList from "@/components/Expenses/ExpensesList";
import PrivateLayout from "@/components/PrivateLayout";
import PrivateRoute from "@/components/PrivateRoute";
import { useAuthStore } from "@/stores/authStore";

const ExpensesFormPage = () => {
  const fetchExpenses = useExpensesStore((state) => state.fetchExpenses);
  const { userID } = useAuthStore();

  useEffect(() => {
    if (userID) {
      fetchExpenses(userID);
    }
  }, [fetchExpenses, userID]);

  return (
    <PrivateRoute>
      <PrivateLayout>
        <ExpensesList />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesFormPage;
