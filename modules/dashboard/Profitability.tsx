import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tooltip } from 'react-tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

import { fetchUserOperations } from '@/lib/api/operationsApi';
import { fetchUserExpenses } from '@/lib/api/expensesApi';
import { useAuthStore } from '@/stores/authStore';
import { Expense } from '@/common/types/';
import { useUserDataStore } from '@/stores/userDataStore';
import { calculateTotals } from '@/common/utils/calculations';
import { currentYearOperations } from '@/common/utils/currentYearOps';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { QueryKeys } from '@/common/enums';

const Profitability = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const validUserID = userID || ''; // Ensure userID is a string

  const {
    data: expenses = [],
    isLoading: isLoadingExpenses,
    error: expensesError,
  } = useQuery({
    queryKey: [QueryKeys.EXPENSES, validUserID],
    queryFn: () => fetchUserExpenses(validUserID),
  });

  const {
    data: operations = [],
    isLoading: isLoadingOperations,
    error: operationsError,
  } = useQuery({
    queryKey: [QueryKeys.OPERATIONS, validUserID],
    queryFn: () => fetchUserOperations(validUserID),
    enabled: !!userID,
  });

  const totals = calculateTotals(currentYearOperations(operations));

  const totalHonorariosNetosAsesor = totals.honorarios_asesor_cerradas;
  const totalHonorariosBroker = totals.honorarios_broker_cerradas;

  const totalAmountInDollarsExpenses = expenses.reduce(
    (acc: number, exp: Expense) => {
      const expenseYear = new Date(exp.date).getFullYear();
      return expenseYear === new Date().getFullYear()
        ? acc + exp.amountInDollars
        : acc;
    },
    0
  );
  const totalExpensesTeamBroker = expenses.reduce(
    (acc: number, exp: Expense) => {
      const expenseYear = new Date(exp.date).getFullYear();
      return expenseYear === new Date().getFullYear()
        ? acc + exp.amountInDollars
        : acc;
    },
    0
  );

  const profitability =
    totalHonorariosNetosAsesor && totalHonorariosNetosAsesor > 0
      ? ((totalHonorariosNetosAsesor - totalAmountInDollarsExpenses) /
          totalHonorariosNetosAsesor) *
        100
      : 0;

  const profitabilityBroker =
    totalHonorariosBroker && totalHonorariosBroker > 0
      ? ((totalHonorariosBroker - totalExpensesTeamBroker) /
          totalHonorariosBroker) *
        100
      : 0;

  // Loader para operaciones o gastos
  if (isLoadingExpenses || isLoadingOperations) {
    return <SkeletonLoader height={220} count={1} />;
  }
  if (operationsError || expensesError) {
    return (
      <p>
        Error:{' '}
        {operationsError?.message ||
          expensesError?.message ||
          'An unknown error occurred'}
      </p>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row gap-8">
      <div className="bg-white rounded-xl p-2 text-center shadow-md flex flex-col items-center h-[208px] w-full relative">
        <p className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[22px] font-semibold flex justify-center items-center h-2/5 pt-6">
          Rentabilidad Propia
        </p>
        <div
          className="absolute top-2 right-2 cursor-pointer"
          data-tooltip-id="profitability-tooltip"
          data-tooltip-content="Porcentaje de los honorarios totales netos menos los gastos."
        >
          <InformationCircleIcon className="text-mediumBlue stroke-2 h-6 w-6 lg:h-5 lg:w-5" />
        </div>
        <Tooltip id="profitability-tooltip" place="top" />
        <p className="text-[48px] lg:text-[40px]  font-bold text-greenAccent h-3/5 items-center justify-center flex">
          {profitability.toFixed(2)}%
        </p>
      </div>
      {userData?.role === 'team_leader_broker' && (
        <div className="bg-white rounded-xl p-2 text-center shadow-md flex flex-col items-center justify-center h-[208px] w-full relative">
          <p className="text-[30px] lg:text-[24px] xl:text-[20px] 2xl:text-[22px] font-semibold flex justify-center items-center h-2/5 pt-6">
            Rentabilidad Total
          </p>
          <div
            className="absolute top-2 right-2  cursor-pointer"
            data-tooltip-id="profitability-tooltip-total"
            data-tooltip-content="Porcentaje de los honorarios totales brutos menos los gastos."
          >
            <InformationCircleIcon className="text-mediumBlue stroke-2 h-6 w-6 lg:h-5 lg:w-5" />
          </div>
          <Tooltip id="profitability-tooltip-total" place="top" />
          <p className="text-[48px] lg:text-[40px] font-bold text-greenAccent h-3/5 items-center justify-center flex">
            {profitabilityBroker.toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default Profitability;
