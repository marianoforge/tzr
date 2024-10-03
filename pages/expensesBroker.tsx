import React from "react";
import PrivateRoute from "../components/PrivateRoute";
import PrivateLayout from "@/components/PrivateLayout";
import ExpensesList from "@/components/Expenses/ExpensesAgent/ExpensesList";
import ExpensesCarouselDash from "@/components/Expenses/ExpensesAgent/ExpensesCarouselDash";

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
