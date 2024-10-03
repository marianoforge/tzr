import React from "react";
import PrivateRoute from "../components/PrivateRoute";
import PrivateLayout from "@/components/PrivateLayout";
import { useUserDataStore } from "@/stores/userDataStore";
import ExpensesList from "@/components/Expenses/ExpensesAgent/ExpensesList";

const ExpensesBroker = () => {
  const { userData } = useUserDataStore();
  return (
    <PrivateRoute requiredRole="team_leader_broker">
      <PrivateLayout>
        {userData && userData.role === "team_leader_broker" && (
          <>
            <div className="hidden xl:block">
              {userData && <ExpensesList currentUser={userData} />}
            </div>
          </>
        )}
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesBroker;
