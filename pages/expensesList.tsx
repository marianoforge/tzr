import { useEffect } from "react";
import { useExpensesStore } from "@/stores/useExpensesStore";
import ExpensesList from "@/components/Expenses/ExpensesList";
import PrivateLayout from "@/components/PrivateLayout";
import PrivateRoute from "@/components/PrivateRoute";
import { useAuthStore } from "@/stores/authStore";
import ExpensesCarouselDash from "@/components/Expenses/ExpensesCarouselDash";

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
        <div className="hidden xl:block">
          <ExpensesList />
        </div>
        <div className="block xl:hidden">
          <ExpensesCarouselDash />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesFormPage;
