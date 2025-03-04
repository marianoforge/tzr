import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ServerIcon } from '@heroicons/react/24/solid';

import { useExpensesStore } from '@/stores/useExpensesStore';
import { formatNumber } from '@/common/utils/formatNumber';
import { Expense, ExpenseAgents } from '@/common/types/';
import usePagination from '@/common/hooks/usePagination';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { formatDate } from '@/common/utils/formatDate';
import useUserAuth from '@/common/hooks/useUserAuth';
import { OPERATIONS_LIST_COLORS } from '@/lib/constants';
import Select from '@/components/PrivateComponente/CommonComponents/Select';
import { monthsFilter, yearsFilter } from '@/lib/data';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
import useFetchUserExpenses from '@/common/hooks/useFetchUserExpenses';
import { useTeamMembers } from '@/common/hooks/useTeamMembers';
import { QueryKeys } from '@/common/enums';

import UserExpensesModal from './UserExpensesModal';

const ExpensesAgentsList = () => {
  const { calculateTotals } = useExpensesStore();
  const userUID = useUserAuth();

  const { data: teamMembers } = useTeamMembers();
  const teamMemberIds = teamMembers
    ?.map((member: { id: string }) => member.id)
    .filter(Boolean);

  const {
    data: usersWithExpenses,
    isLoading,
    error: expensesError,
  } = useFetchUserExpenses(teamMemberIds);

  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState('all');
  const { currencySymbol } = useUserCurrencySymbol(userUID || '');

  const groupedExpensesByUser = useMemo(() => {
    if (!usersWithExpenses) return [];

    // 1) Filtrar primero por nombre y apellido
    const filteredUsers = usersWithExpenses.filter((user: ExpenseAgents) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });

    // 2) Para cada usuario filtrado, filtrar los gastos por año/mes
    const finalData = filteredUsers.map((user: ExpenseAgents) => {
      const userExpenses = user.expenses.filter((expense: Expense) => {
        const matchesYear = expense.date.includes(yearFilter.toString());
        const matchesMonth =
          monthFilter === 'all' ||
          new Date(expense.date).getMonth() + 1 === parseInt(monthFilter);

        return matchesYear && matchesMonth;
      });

      const totalInPesos = userExpenses.reduce(
        (acc: number, expense: Expense) => acc + expense.amount,
        0
      );

      const totalInDollars = userExpenses.reduce(
        (acc: number, expense: Expense) => acc + expense.amountInDollars,
        0
      );

      return {
        ...user,
        expenses: userExpenses,
        totalInPesos,
        totalInDollars,
      };
    });

    return finalData.filter((user: ExpenseAgents) => user.expenses.length > 0);
  }, [usersWithExpenses, searchQuery, yearFilter, monthFilter]);

  const [isDateAscending, setIsDateAscending] = useState<boolean | null>(null);

  const sortedExpenses = useMemo(() => {
    if (!groupedExpensesByUser) return [];
    return [...groupedExpensesByUser].sort((a, b) => {
      if (isDateAscending === null) return 0;
      return isDateAscending
        ? new Date(a.expenses[0].date).getTime() -
            new Date(b.expenses[0].date).getTime()
        : new Date(b.expenses[0].date).getTime() -
            new Date(a.expenses[0].date).getTime();
    });
  }, [groupedExpensesByUser, isDateAscending]);

  const toggleDateSortOrder = () => {
    setIsDateAscending((prev) => (prev === null ? true : !prev));
  };

  const itemsPerPage = 10;
  const {
    currentItems: currentExpenses,
    currentPage,
    totalPages,
    handlePageChange,
    disablePagination,
  } = usePagination(sortedExpenses, itemsPerPage);

  useEffect(() => {
    if (usersWithExpenses) {
      calculateTotals();
    }
  }, [usersWithExpenses, calculateTotals]);

  const pageTitle = 'Lista de Gastos por asesor';

  const [selectedUserExpenses, setSelectedUserExpenses] = useState<
    Expense[] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const openModalWithExpenses = (agentId: string, expenses: Expense[]) => {
    setSelectedAgentId(agentId);
    setSelectedUserExpenses(expenses);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserExpenses(null);
  };

  const queryClient = useQueryClient();

  const mutationDeleteExpense = useMutation({
    mutationFn: async ({
      agentId,
      expenseId,
    }: {
      agentId: string;
      expenseId: string;
    }) => {
      const response = await fetch(
        `/api/teamMembers/${agentId}/expenses?expenseId=${expenseId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error('Error al eliminar el gasto');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXPENSES] }); // Invalida las queries relacionadas
      calculateTotals(); // Recalcula totales
    },
  });

  const handleDeleteExpense = (agentId: string, expenseId: string) => {
    mutationDeleteExpense.mutate({ agentId, expenseId });
  };

  if (isLoading) {
    return (
      <div className="mt-[70px]">
        <SkeletonLoader height={64} count={11} />
      </div>
    );
  }
  if (expensesError) {
    return <p>Error: {expensesError.message || 'An unknown error occurred'}</p>;
  }

  return (
    <div className="bg-white p-4 mt-20 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">{pageTitle}</h2>
      <div className="overflow-x-auto flex flex-col justify-around">
        <div className="flex md:flex-col lg:flex-row justify-around items-center mt-2  text-mediumBlue w-full">
          <input
            type="text"
            placeholder="Buscar por asesor "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[200px] h-[40px] p-2 mb-8 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic text-center"
          />
          <Select
            options={yearsFilter}
            value={yearFilter}
            onChange={(value: string | number) => setYearFilter(Number(value))}
            className="w-[200px] h-[40px] p-2 mb-8 border border-gray-300 rounded font-semibold"
          />

          <Select
            options={monthsFilter}
            value={monthFilter}
            onChange={(value: string | number) =>
              setMonthFilter(value.toString())
            }
            className="w-[200px] h-[40px] p-2 mb-8 border border-gray-300 rounded font-semibold"
          />
        </div>

        {currentExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <ServerIcon className="h-12 w-12" strokeWidth={1} />
            <p className="text-center text-gray-600">
              No existen gastos asociados a asesores
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-lightBlue/10 hidden md:table-row text-center text-sm">
                  <th
                    className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold cursor-pointer flex items-center justify-center`}
                    onClick={toggleDateSortOrder}
                  >
                    Fecha
                    <span className="ml-1 text-xs text-mediumBlue items-center justify-center">
                      {isDateAscending ? (
                        <ArrowUpIcon
                          className="h-4 w-4 text-mediumBlue"
                          strokeWidth={3}
                        />
                      ) : (
                        <ArrowDownIcon
                          className="h-4 w-4 text-mediumBlue"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                  </th>
                  <th
                    className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                  >
                    Nombre y Apellido
                  </th>
                  <th
                    className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                  >
                    Monto Total en ARS
                  </th>
                  <th
                    className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                  >
                    Monto Total en USD
                  </th>
                  {/* <th
                    className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                  >
                    Ver Detalle de Gastos
                  </th> */}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b transition duration-150 ease-in-out text-center"
                  >
                    <td className="py-3 px-4">
                      {user.expenses.length > 0
                        ? formatDate(user.expenses[0].date)
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {`${user.firstName} ${user.lastName}`}
                    </td>
                    <td className="py-3 px-4">
                      {`${currencySymbol}${formatNumber(user.totalInPesos)}`}
                    </td>
                    <td className="py-3 px-4">
                      {`${currencySymbol}${formatNumber(user.totalInDollars)}`}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          openModalWithExpenses(user.id, user.expenses)
                        }
                        className="text-mediumBlue underline"
                      >
                        Ver Lista de Gastos
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="font-bold hidden md:table-row bg-lightBlue/10">
                  <td className="py-3 px-4 text-center" colSpan={1}>
                    Total
                  </td>
                  <td></td>
                  <td className="py-3 px-4 text-center">
                    {currencySymbol}
                    {formatNumber(
                      groupedExpensesByUser.reduce(
                        (acc: number, user: ExpenseAgents) =>
                          acc + user.totalInPesos,
                        0
                      )
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {currencySymbol}
                    {formatNumber(
                      groupedExpensesByUser.reduce(
                        (acc: number, user: ExpenseAgents) =>
                          acc + user.totalInDollars,
                        0
                      )
                    )}
                  </td>
                  <td className="py-3 px-4" colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || disablePagination}
            className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
          >
            Anterior
          </button>
          <span className="px-4 py-2 mx-1">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || disablePagination}
            className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
          >
            Siguiente
          </button>
        </div>
      </div>
      <UserExpensesModal
        isOpen={isModalOpen}
        onClose={closeModal}
        expenses={selectedUserExpenses || []}
        currencySymbol={currencySymbol}
        onDeleteExpense={(expenseId) =>
          handleDeleteExpense(selectedAgentId!, expenseId)
        }
        agentId={selectedAgentId!}
        message="Detalle de Gastos"
      />
    </div>
  );
};

export default ExpensesAgentsList;
