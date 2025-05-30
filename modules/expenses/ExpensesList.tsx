import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useExpensesStore } from '@/stores/useExpensesStore';
import {
  fetchUserExpenses,
  deleteExpense,
  updateExpense,
} from '@/lib/api/expensesApi';
import { formatNumber } from '@/common/utils/formatNumber';
import { Expense } from '@/common/types/';
import usePagination from '@/common/hooks/usePagination';
import useModal from '@/common/hooks/useModal';
import ModalDelete from '@/components/PrivateComponente/CommonComponents/Modal';
import { formatDate } from '@/common/utils/formatDate';
import useUserAuth from '@/common/hooks/useUserAuth';
import Select from '@/components/PrivateComponente/CommonComponents/Select';
import { monthsFilter, yearsFilter, expenseTypes } from '@/lib/data';
import { ExpenseType, QueryKeys } from '@/common/enums';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
import { useUserDataStore } from '@/stores/userDataStore';

import ExpensesModal from './ExpensesModal';

const ExpensesList = () => {
  const { calculateTotals } = useExpensesStore();
  const userUID = useUserAuth();
  const queryClient = useQueryClient();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState('all');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('all');
  const { currencySymbol } = useUserCurrencySymbol(userUID || '');
  const { userData } = useUserDataStore();
  const currency = userData?.currency;

  const {
    data: expenses,
    isLoading,
    error: expensesError,
  } = useQuery({
    queryKey: [QueryKeys.EXPENSES, userUID],
    queryFn: () => fetchUserExpenses(userUID as string),
    enabled: !!userUID,
  });

  const filteredExpenses = useMemo(
    () =>
      expenses?.filter((expense: Expense) => {
        const matchesSearch = expense.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesYear = expense.date.includes(yearFilter.toString());
        const matchesMonth =
          monthFilter === 'all' ||
          new Date(expense.date).getMonth() + 1 === parseInt(monthFilter);
        const matchesType =
          expenseTypeFilter === ExpenseType.ALL ||
          expense.expenseType === expenseTypeFilter;

        return matchesSearch && matchesYear && matchesMonth && matchesType;
      }) || [],
    [expenses, searchQuery, yearFilter, monthFilter, expenseTypeFilter]
  );

  const [isDateAscending, setIsDateAscending] = useState<boolean | null>(null);

  const sortedExpenses = useMemo(() => {
    if (!filteredExpenses) return [];
    return [...filteredExpenses].sort((a, b) => {
      if (isDateAscending === null) return 0;
      return isDateAscending
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredExpenses, isDateAscending]);

  const toggleDateSortOrder = () => {
    setIsDateAscending((prev) => (prev === null ? true : !prev));
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchQuery('');
    setYearFilter(new Date().getFullYear());
    setMonthFilter('all');
    setExpenseTypeFilter('all');
  };

  const itemsPerPage = 10;
  const {
    currentItems: currentExpenses,
    currentPage,
    totalPages,
    handlePageChange,
    disablePagination,
  } = usePagination(sortedExpenses, itemsPerPage);

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
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EXPENSES, userUID],
      });
      calculateTotals();
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: (updatedExpense: Expense) => updateExpense(updatedExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EXPENSES, userUID],
      });
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
      <div className="bg-white p-4 rounded-xl shadow-md">
        {/* Header profesional y moderno - GASTOS */}
        <div className="mb-6 border-l-4 border-orange-500 pl-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
                  <p className="text-sm text-orange-600 font-medium">
                    Gestión de gastos empresariales
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm">
                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                <span className="text-sm font-semibold text-orange-700">
                  Gastos
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>
        <p className="text-center">Cargando datos...</p>
      </div>
    );
  }

  if (expensesError) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md">
        {/* Header profesional y moderno - GASTOS */}
        <div className="mb-6 border-l-4 border-orange-500 pl-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
                  <p className="text-sm text-orange-600 font-medium">
                    Gestión de gastos empresariales
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm">
                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                <span className="text-sm font-semibold text-orange-700">
                  Gastos
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-red-500">
          Error: {expensesError.message || 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      {/* Header profesional y moderno - GASTOS */}
      <div className="mb-6 border-l-4 border-orange-500 pl-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
                <p className="text-sm text-orange-600 font-medium">
                  Gestión de gastos empresariales
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm">
              <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
              <span className="text-sm font-semibold text-orange-700">
                Gastos
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex flex-col justify-around">
        {/* Filtros modernos con el mismo estilo que operaciones */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-md border border-gray-200 mb-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-orange-600">
                Filtros de Búsqueda
              </h3>
              <p className="text-sm text-gray-600">
                Personaliza tu búsqueda de gastos
              </p>
            </div>
          </div>

          {/* Filters in Single Row */}
          <div className="flex gap-4 items-end w-full">
            {/* Search Input */}
            <div className="w-[220px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MagnifyingGlassIcon className="w-4 h-4 inline mr-2" />
                Búsqueda General
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 border-2 border-gray-300 rounded-lg font-medium placeholder-gray-400 text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 focus:outline-none hover:border-gray-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-orange-600 transition-colors duration-200" />
                </div>
              </div>
            </div>

            {/* Year Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-2" />
                Año
              </label>
              <div className="relative">
                <Select
                  options={yearsFilter}
                  value={yearFilter}
                  onChange={(value: string | number) =>
                    setYearFilter(Number(value))
                  }
                  className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Month Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-2" />
                Mes
              </label>
              <div className="relative">
                <Select
                  options={monthsFilter}
                  value={monthFilter}
                  onChange={(value: string | number) =>
                    setMonthFilter(value.toString())
                  }
                  className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expense Type Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <TagIcon className="w-4 h-4 inline mr-2" />
                Tipo de Gasto
              </label>
              <div className="relative">
                <Select
                  options={expenseTypes}
                  value={expenseTypeFilter}
                  onChange={(value: string | number) =>
                    setExpenseTypeFilter(value.toString())
                  }
                  className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white shadow-sm transition-all duration-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 focus:outline-none hover:border-gray-400 appearance-none cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-gray-500 hover:text-orange-600 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-gray-100"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Filter Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">
                Filtros activos:
              </span>
              <div className="flex gap-1 flex-wrap">
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600/10 text-orange-600">
                    Búsqueda
                  </span>
                )}
                {yearFilter !== new Date().getFullYear() && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600/10 text-orange-600">
                    Año
                  </span>
                )}
                {monthFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600/10 text-orange-600">
                    Mes
                  </span>
                )}
                {expenseTypeFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-600/10 text-orange-600">
                    Tipo
                  </span>
                )}
              </div>
              {!searchQuery &&
                yearFilter === new Date().getFullYear() &&
                monthFilter === 'all' &&
                expenseTypeFilter === 'all' && (
                  <span className="text-xs text-gray-400">Ninguno</span>
                )}
            </div>
          </div>
        </div>

        {currentExpenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center justify-center">
              <CurrencyDollarIcon className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No existen gastos
              </p>
              <p className="text-gray-400 text-sm">
                Crea tu primer gasto para comenzar a gestionar tus finanzas
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-orange-50 hidden md:table-row text-center text-sm">
                  <th
                    className="py-3 px-4 text-gray-700 font-semibold cursor-pointer flex items-center justify-center hover:bg-orange-100 transition-colors"
                    onClick={toggleDateSortOrder}
                  >
                    Fecha
                    <span className="ml-1 text-xs text-orange-600 items-center justify-center">
                      {isDateAscending ? (
                        <ArrowUpIcon
                          className="h-4 w-4 text-orange-600"
                          strokeWidth={3}
                        />
                      ) : (
                        <ArrowDownIcon
                          className="h-4 w-4 text-orange-600"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                  </th>
                  <th className="py-3 px-4 text-gray-700 font-semibold">
                    Monto en Moneda Local
                  </th>
                  {currency === 'USD' && (
                    <th className="py-3 px-4 text-gray-700 font-semibold">
                      Monto en Dólares
                    </th>
                  )}
                  <th className="py-3 px-4 text-gray-700 font-semibold">
                    Tipo
                  </th>
                  <th className="py-3 px-4 text-gray-700 font-semibold">
                    Descripción
                  </th>
                  <th className="py-3 px-4 text-gray-700 font-semibold">
                    Recurrente
                  </th>
                  <th className="py-3 px-4 text-gray-700 font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors text-center"
                  >
                    <td className="py-3 px-4 text-gray-800">
                      {formatDate(expense.date)}
                    </td>
                    <td className="py-3 px-4 text-gray-800">
                      {expense.amount < 0
                        ? `-${currencySymbol}${formatNumber(Math.abs(expense.amount))}`
                        : `${currencySymbol}${formatNumber(expense.amount)}`}
                    </td>
                    {currency === 'USD' && (
                      <td className="py-3 px-4 text-gray-800">
                        {expense.amountInDollars < 0
                          ? `-${currencySymbol}${formatNumber(Math.abs(expense.amountInDollars))}`
                          : `${currencySymbol}${formatNumber(expense.amountInDollars)}`}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {expense.expenseType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800">
                      {expense.description}
                    </td>
                    <td className="py-3 px-4">
                      {expense.isRecurring ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Mensual
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(expense)}
                          className="text-blue-500 hover:text-blue-700 transition-colors text-sm font-semibold p-1 rounded hover:bg-blue-50"
                          title="Editar gasto"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteButtonClick(expense)}
                          className="text-red-500 hover:text-red-700 transition-colors text-sm font-semibold p-1 rounded hover:bg-red-50"
                          title="Eliminar gasto"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="font-bold hidden md:table-row bg-orange-50 border-t-2 border-orange-200">
                  <td className="py-4 px-4 text-center text-gray-800">Total</td>
                  <td className="py-4 px-4 text-center text-gray-800">
                    {(() => {
                      const totalAmount = filteredExpenses.reduce(
                        (acc: number, expense: Expense) => acc + expense.amount,
                        0
                      );
                      return totalAmount < 0
                        ? `-${currencySymbol}${formatNumber(Math.abs(totalAmount))}`
                        : `${currencySymbol}${formatNumber(totalAmount)}`;
                    })()}
                  </td>
                  {currency === 'USD' && (
                    <td className="py-4 px-4 text-center text-gray-800">
                      {(() => {
                        const totalAmountInDollars = filteredExpenses.reduce(
                          (acc: number, expense: Expense) =>
                            acc + expense.amountInDollars,
                          0
                        );
                        return totalAmountInDollars < 0
                          ? `-${currencySymbol}${formatNumber(Math.abs(totalAmountInDollars))}`
                          : `${currencySymbol}${formatNumber(totalAmountInDollars)}`;
                      })()}
                    </td>
                  )}
                  <td className="py-4 px-4" colSpan={4}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación mejorada */}
        {totalPages > 0 ? (
          <div className="flex flex-col sm:flex-row justify-center items-center mt-6 mb-4 space-y-2 sm:space-y-0">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || disablePagination}
              className="px-4 py-2 mx-1 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors duration-200 shadow-sm"
            >
              Anterior
            </button>
            <span className="px-4 py-2 mx-1 text-sm text-gray-600">
              Página {currentPage} de {totalPages}
              {currentExpenses.length > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  ({currentExpenses.length} resultados)
                </span>
              )}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || disablePagination}
              className="px-4 py-2 mx-1 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors duration-200 shadow-sm"
            >
              Siguiente
            </button>
          </div>
        ) : (
          currentExpenses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                No se encontraron gastos con los filtros aplicados.
              </p>
            </div>
          )
        )}
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
        message="¿Estás seguro de querer eliminar este gasto?"
        onSecondButtonClick={() => {
          confirmDelete();
        }}
        secondButtonText="Eliminar Gasto"
        className="w-[450px]"
      />
    </div>
  );
};

export default ExpensesList;
