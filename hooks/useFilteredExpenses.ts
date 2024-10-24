import { useMemo } from 'react';

import { Expense } from '@/types';

const useFilteredExpenses = (expenses: Expense[]) => {
  const { teamBrokerExpenses, nonTeamBrokerExpenses, totals } = useMemo(() => {
    const teamBrokerExpenses = expenses.filter(
      (expense) => expense.expenseAssociationType === 'team_broker'
    );

    const nonTeamBrokerExpenses = expenses.filter(
      (expense) => expense.expenseAssociationType !== 'team_broker'
    );

    const totals = {
      teamBrokerTotal: teamBrokerExpenses.reduce(
        (acc, expense) => {
          acc.totalAmount += expense.amount;
          acc.totalAmountInDollars += expense.amountInDollars;
          return acc;
        },
        { totalAmount: 0, totalAmountInDollars: 0 }
      ),
      nonTeamBrokerTotal: nonTeamBrokerExpenses.reduce(
        (acc, expense) => {
          acc.totalAmount += expense.amount;
          acc.totalAmountInDollars += expense.amountInDollars;
          return acc;
        },
        { totalAmount: 0, totalAmountInDollars: 0 }
      ),
    };

    return { teamBrokerExpenses, nonTeamBrokerExpenses, totals };
  }, [expenses]);

  return { teamBrokerExpenses, nonTeamBrokerExpenses, totals };
};

export default useFilteredExpenses;
