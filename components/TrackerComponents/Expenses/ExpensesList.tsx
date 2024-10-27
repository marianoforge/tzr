import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useExpensesStore } from '@/stores/useExpensesStore';
import {
  fetchUserExpenses,
  deleteExpense,
  updateExpense,
} from '@/lib/api/expensesApi';
import { formatNumber } from '@/utils/formatNumber';
import { Expense } from '@/types';
import useFilteredExpenses from '@/hooks/useFilteredExpenses';
import { OPERATIONS_LIST_COLORS } from '@/lib/constants';
import useUserAuth from '@/hooks/useUserAuth';
import usePagination from '@/hooks/usePagination';
import useModal from '@/hooks/useModal';

import SkeletonLoader from '../CommonComponents/SkeletonLoader';
import ModalDelete from '@/components/TrackerComponents/CommonComponents/Modal';
import ExpensesModal from './ExpensesModal';
import { formatDate } from '@/utils/formatDate';

const ExpensesList = () => {
  const { calculateTotals } = useExpensesStore();
  const userUID = useUserAuth();
  const queryClient = useQueryClient();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const {
    data: expenses,
    isLoading,
    error: expensesError,
  } = useQuery({
    queryKey: ['expenses', userUID],
    queryFn: () => fetchUserExpenses(userUID as string),
    enabled: !!userUID,
  });

  const { teamBrokerExpenses, nonTeamBrokerExpenses } = useFilteredExpenses(
    expenses || []
  );

  const filteredExpenses = useRouter().pathname.includes('expensesBroker')
    ? teamBrokerExpenses
    : nonTeamBrokerExpenses;

  const itemsPerPage = 10;
  const {
    currentItems: currentExpenses,
    currentPage,
    totalPages,
    handlePageChange,
    disablePagination,
  } = usePagination(filteredExpenses, itemsPerPage);

  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  useEffect(() => {
    if (expenses) {
      calculateTotals();
    }
  }, [expenses, calculateTotals]);

  const mutationDelete = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', userUID] });
      calculateTotals();
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: (updatedExpense: Expense) => updateExpense(updatedExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', userUID] });
      calculateTotals();
    },
  });

  const handleDeleteClick = useCallback(
    (id: string) => {
      mutationDelete.mutate(id);
    },
    [mutationDelete]
  );

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    openEditModal();
  };

  const handleExpenseUpdate = (updatedExpense: Expense) => {
    mutationUpdate.mutate(updatedExpense);
  };

  const pageTitle = useRouter().pathname.includes('expensesBroker')
    ? 'Lista de Gastos Team / Broker'
    : 'Lista de Gastos propios';

  const handleDeleteButtonClick = (expense: Expense) => {
    setSelectedExpense(expense);
    openDeleteModal();
  };

  const confirmDelete = () => {
    if (selectedExpense?.id) {
      handleDeleteClick(selectedExpense.id);
      closeDeleteModal();
    }
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

      {currentExpenses.length === 0 ? (
        <p className="text-center text-gray-600">No existen gastos</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-lightBlue/10 hidden md:table-row text-center text-sm">
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Fecha
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Monto en ARS
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Monto en Dólares
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Tipo
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Descripción
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-b transition duration-150 ease-in-out text-center"
                >
                  <td className="py-3 px-4">{formatDate(expense.date)}</td>
                  <td className="py-3 px-4">${formatNumber(expense.amount)}</td>
                  <td className="py-3 px-4">
                    ${formatNumber(expense.amountInDollars)}
                  </td>
                  <td className="py-3 px-4">{expense.expenseType}</td>
                  <td className="py-3 px-4">{expense.description}</td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEditClick(expense)}
                      className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteButtonClick(expense)}
                      className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold ml-4"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-bold hidden md:table-row bg-lightBlue/10">
                <td className="py-3 px-4 text-center" colSpan={1}>
                  Total
                </td>
                <td className="py-3 px-4 text-center">
                  $
                  {formatNumber(
                    filteredExpenses.reduce(
                      (acc, expense) => acc + expense.amount,
                      0
                    )
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  $
                  {formatNumber(
                    filteredExpenses.reduce(
                      (acc, expense) => acc + expense.amountInDollars,
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

      {isEditModalOpen && selectedExpense && (
        <ExpensesModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          expense={selectedExpense}
          onExpenseUpdate={handleExpenseUpdate}
        />
      )}
      <ModalDelete
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        message="¿Estás seguro de querer eliminar esta operación?"
        onSecondButtonClick={() => {
          confirmDelete();
        }}
        secondButtonText="Borrar Operación"
        className="w-[450px]"
      />
    </div>
  );
};

export default ExpensesList;
