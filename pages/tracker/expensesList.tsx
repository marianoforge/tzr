import { useEffect } from "react";
import { useExpensesStore } from "@/stores/useExpensesStore";
import ExpensesList from "@/components/TrackeComponents/Expenses/ExpensesAgent/ExpensesList";
import PrivateLayout from "@/components/TrackeComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackeComponents/PrivateRoute";
import { useAuthStore } from "@/stores/authStore";
import ExpensesCarouselDash from "@/components/TrackeComponents/Expenses/ExpensesAgent/ExpensesCarouselDash";

const ExpensesFormPage = () => {
  const fetchItems = useExpensesStore((state) => state.fetchItems); // Cambiado de fetchExpenses a fetchItems
  const { userID } = useAuthStore();

  useEffect(() => {
    if (userID) {
      fetchItems(userID); // También se cambia aquí
    }
  }, [fetchItems, userID]);

  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden xl:block">
          {" "}
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
