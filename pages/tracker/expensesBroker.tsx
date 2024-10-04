import React from "react";
import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";
import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import ExpensesList from "@/components/TrackerComponents/Expenses/ExpensesAgent/ExpensesList";
import ExpensesCarouselDash from "@/components/TrackerComponents/Expenses/ExpensesAgent/ExpensesCarouselDash";

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
