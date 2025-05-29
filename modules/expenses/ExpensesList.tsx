import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
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

  // Función para contar filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (yearFilter !== new Date().getFullYear()) count++;
    if (monthFilter !== 'all') count++;
    if (expenseTypeFilter !== 'all') count++;
    return count;
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
        {/* Filtros modernos en diseño horizontal */}
        <div className="mb-6">
          {/* Header de filtros */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FunnelIcon className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Filtros de Búsqueda
              </h3>
              {getActiveFiltersCount() > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {getActiveFiltersCount()} filtro
                  {getActiveFiltersCount() > 1 ? 's' : ''} activo
                  {getActiveFiltersCount() > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Utiliza los filtros para encontrar gastos específicos y refinar tu
              búsqueda
            </p>
          </div>

          {/* Filtros en layout horizontal */}
          <div className="flex gap-4 items-end flex-wrap">
            {/* Campo de búsqueda */}
            <div className="flex-1 min-w-[280px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                Buscar por descripción
              </label>
              <input
                type="text"
                placeholder="Ej: oficina, viáticos, marketing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg font-medium placeholder-gray-400 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Filtro de año */}
            <div className="min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Año
              </label>
              <Select
                options={yearsFilter}
                value={yearFilter}
                onChange={(value: string | number) =>
                  setYearFilter(Number(value))
                }
                className="w-full h-10 px-3 border border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Filtro de mes */}
            <div className="min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Mes
              </label>
              <Select
                options={monthsFilter}
                value={monthFilter}
                onChange={(value: string | number) =>
                  setMonthFilter(value.toString())
                }
                className="w-full h-10 px-3 border border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Filtro de tipo */}
            <div className="min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <TagIcon className="h-4 w-4 inline mr-1" />
                Tipo de Gasto
              </label>
              <Select
                options={expenseTypes}
                value={expenseTypeFilter}
                onChange={(value: string | number) =>
                  setExpenseTypeFilter(value.toString())
                }
                className="w-full h-10 px-3 border border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Botón limpiar filtros */}
            {getActiveFiltersCount() > 0 && (
              <div className="min-w-[120px]">
                <button
                  onClick={clearFilters}
                  className="w-full h-10 px-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
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
