import { useEffect } from "react";
import { useExpensesStore } from "@/stores/useExpensesStore";
import ExpensesList from "@/components/Expenses/ExpensesAgent/ExpensesList";
import PrivateLayout from "@/components/PrivateLayout";
import PrivateRoute from "@/components/PrivateRoute";
import { useAuthStore } from "@/stores/authStore";
import ExpensesCarouselDash from "@/components/Expenses/ExpensesAgent/ExpensesCarouselDash";
import { useUserDataStore } from "@/stores/userDataStore";

const ExpensesFormPage = () => {
  const fetchItems = useExpensesStore((state) => state.fetchItems); // Cambiado de fetchExpenses a fetchItems
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  useEffect(() => {
    if (userID) {
      fetchItems(userID); // También se cambia aquí
    }
  }, [fetchItems, userID]);

  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden xl:block">
          {userData && <ExpensesList currentUser={userData} />}
        </div>
        <div className="block xl:hidden">
          <ExpensesCarouselDash />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesFormPage;
