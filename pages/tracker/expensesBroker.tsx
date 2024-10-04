import React from "react";
import PrivateRoute from "@/components/TrackeComponents/PrivateRoute";
import PrivateLayout from "@/components/TrackeComponents/PrivateLayout";
import ExpensesList from "@/components/TrackeComponents/Expenses/ExpensesAgent/ExpensesList";
import ExpensesCarouselDash from "@/components/TrackeComponents/Expenses/ExpensesAgent/ExpensesCarouselDash";

const ExpensesBroker = () => {
  return (
    <PrivateRoute requiredRole="team_leader_broker">
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

export default ExpensesBroker;
