import { useEffect } from "react";
import { useExpensesStore } from "@/stores/useExpensesStore";
import ExpensesList from "@/components/TrackerComponents/Expenses/ExpensesList";
import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";
import { useAuthStore } from "@/stores/authStore";
import ExpensesListCards from "@/components/TrackerComponents/Expenses/ExpensesListCards";

const ExpensesFormPage = () => {
  const fetchItems = useExpensesStore((state) => state.fetchItems);
  const { userID } = useAuthStore();

  useEffect(() => {
    if (userID) {
      fetchItems(userID);
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
          <ExpensesListCards />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesFormPage;
