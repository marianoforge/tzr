import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";
import { useExpensesStore } from "@/stores/useExpensesStore";
import Loader from "../Loader";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserExpenses,
  deleteExpense,
  updateExpense,
} from "@/lib/api/expensesApi";
import { formatNumber } from "@/utils/formatNumber";
import { Expense } from "@/types";
import ExpensesModal from "./ExpensesModal";
import useFilteredExpenses from "@/hooks/useFilteredExpenses";

const ExpensesList = () => {
  const { calculateTotals } = useExpensesStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Manejar la autenticación del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Solo ejecutar la consulta si userUID está definido
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses", userUID], // Query key
    queryFn: () => fetchUserExpenses(userUID as string), // Query function
    enabled: !!userUID, // Solo habilitar la consulta si userUID no es null
  });

  // Recalcular los totales cuando los datos sean cargados
  useEffect(() => {
    if (expenses) {
      calculateTotals();
    }
  }, [expenses, calculateTotals]);

  // Mutation para eliminar un gasto
  const mutationDelete = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", userUID] }); // Correctly pass the query key
      calculateTotals(); // Recalcular los totales
    },
  });

  // Mutation para actualizar un gasto
  const mutationUpdate = useMutation({
    mutationFn: (updatedExpense: Expense) => updateExpense(updatedExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", userUID] }); // Correctly pass the query key
      calculateTotals(); // Recalcular los totales
    },
  });

  const handleDeleteClick = (id: string | undefined) => {
    if (id) mutationDelete.mutate(id);
  };

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleExpenseUpdate = (updatedExpense: Expense) => {
    mutationUpdate.mutate(updatedExpense);
  };

  // Filtrar gastos basados en la ruta
  const { teamBrokerExpenses, nonTeamBrokerExpenses, totals } =
    useFilteredExpenses(expenses || []);

  const filteredExpenses = router.pathname.includes("expensesBroker")
    ? teamBrokerExpenses
    : nonTeamBrokerExpenses;

  const filteredTotals = router.pathname.includes("expensesBroker")
    ? totals.teamBrokerTotal
    : totals.nonTeamBrokerTotal;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-4 mt-20 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Lista de Gastos</h2>

      {currentExpenses.length === 0 ? (
        <p className="text-center text-gray-600">No existen gastos</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 font-semibold text-center">Fecha</th>
                <th className="py-3 px-4 font-semibold text-center">
                  Monto en ARS
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Monto en Dólares
                </th>
                <th className="py-3 px-4 font-semibold text-center">Tipo</th>
                <th className="py-3 px-4 font-semibold text-center">
                  Descripción
                </th>
                <th className="py-3 px-4 font-semibold text-center">
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
                  <td className="py-3 px-4">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
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
                      onClick={() => handleDeleteClick(expense.id)}
                      className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold ml-4"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="font-bold bg-gray-100">
                <td className="py-3 px-4 text-center" colSpan={1}>
                  Total
                </td>
                <td className="py-3 px-4 text-center">
                  ${formatNumber(filteredTotals.totalAmount)}
                </td>
                <td className="py-3 px-4 text-center">
                  ${formatNumber(filteredTotals.totalAmountInDollars)}
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
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
        >
          Anterior
        </button>
        <span className="px-4 py-2 mx-1">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
        >
          Siguiente
        </button>
      </div>
      {isEditModalOpen && selectedExpense && (
        <ExpensesModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          expense={selectedExpense}
          onExpenseUpdate={handleExpenseUpdate}
        />
      )}
    </div>
  );
};

export default ExpensesList;
