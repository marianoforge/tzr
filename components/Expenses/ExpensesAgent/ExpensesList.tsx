import { useState, useEffect } from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { useExpensesStore } from "@/stores/useExpensesStore";
import Loader from "../../Loader";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

import { formatNumber } from "@/utils/formatNumber";
import { Expense } from "@/types";
import ExpensesModal from "./ExpensesModal";
import useFilteredExpenses from "@/hooks/useFilteredExpenses";

const ExpensesList = () => {
  const { expenses, setExpenses, isLoading, calculateTotals } =
    useExpensesStore();
  const { teamBrokerExpenses, nonTeamBrokerExpenses, totals } =
    useFilteredExpenses(expenses);
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleExpenseUpdate = (updatedExpense: Expense) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      ) as Expense[] // Forzar el tipo como Expense[]
    );
    calculateTotals();
  };

  const handleDeleteClick = async (id: string | undefined) => {
    if (!id) {
      console.error("Error: El gasto no tiene un ID");
      return;
    }

    try {
      const response = await axios.delete(`/api/expenses/${id}`);
      if (response.status !== 200) {
        throw new Error("Error deleting expense");
      }
      setExpenses(
        expenses.filter((expense: { id?: string }) => expense.id !== id)
      );
      calculateTotals();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

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

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!userUID) return;

      try {
        const response = await axios.get(`/api/expenses/user/${userUID}`);

        if (response.status !== 200) {
          throw new Error("Error fetching user expenses");
        }

        const data = response.data;
        setExpenses(data);
        calculateTotals();
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, [userUID, setExpenses, calculateTotals]);

  const filteredExpenses = router.pathname.includes("expensesBroker")
    ? teamBrokerExpenses
    : nonTeamBrokerExpenses;

  const filteredTotals = router.pathname.includes("expensesBroker")
    ? totals.teamBrokerTotal
    : totals.nonTeamBrokerTotal;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-6 mt-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Lista de Gastos</h2>

      {filteredExpenses.length === 0 ? (
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
              {filteredExpenses.map((expense) => (
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
      {isEditModalOpen && selectedExpense && (
        <ExpensesModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          expense={selectedExpense}
          onExpenseUpdate={handleExpenseUpdate} // Pasar la función para actualizar el estado
        />
      )}
    </div>
  );
};

export default ExpensesList;
