import React from 'react';

import PrivateRoute from '@/components/TrackerComponents/PrivateRoute';
import PrivateLayout from '@/components/TrackerComponents/PrivateLayout';
import ExpensesList from '@/components/TrackerComponents/Expenses/ExpensesList';
import ExpensesListCards from '@/components/TrackerComponents/Expenses/ExpensesListCards';
import ExpensesBarchart from '@/components/TrackerComponents/Expenses/ExpensesBarchart';

const ExpensesBroker = () => {
  return (
    <PrivateRoute requiredRole="team_leader_broker">
      <PrivateLayout>
        <div className="hidden xl:block">
          <ExpensesList />
        </div>
        <div className="block xl:hidden">
          <ExpensesListCards />
        </div>
        <div className="hidden sm:block my-8">
          <ExpensesBarchart />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ExpensesBroker;
