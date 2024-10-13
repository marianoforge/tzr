import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { formatNumber } from "@/utils/formatNumber";
import { Expense } from "@/types";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useExpensesStore } from "@/stores/useExpensesStore";
import { useRouter } from "next/router";
import Loader from "../Loader";
import ExpensesModal from "./ExpensesModal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import useFilteredExpenses from "@/hooks/useFilteredExpenses";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserExpenses,
  deleteExpense,
  updateExpense,
} from "@/lib/api/expensesApi";

const ExpensesListCards: React.FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const { calculateTotals } = useExpensesStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

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

  // Obtener los gastos basados en el UID del usuario
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses", userUID],
    queryFn: () => fetchUserExpenses(userUID as string),
    enabled: !!userUID,
  });

  // Actualizar los totales cuando los datos estén cargados
  useEffect(() => {
    if (expenses) {
      calculateTotals();
    }
  }, [expenses, calculateTotals]);

  // Mutation para eliminar un gasto
  const mutationDelete = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", userUID] });
      calculateTotals();
    },
  });

  // Mutation para actualizar un gasto
  const mutationUpdate = useMutation({
    mutationFn: (updatedExpense: Expense) => updateExpense(updatedExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", userUID] });
      calculateTotals();
    },
  });

  // Manejar eliminación
  const handleDeleteClick = (id: string | undefined) => {
    if (id) mutationDelete.mutate(id);
  };

  // Manejar la edición
  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  // Manejar la actualización desde el modal
  const handleExpenseUpdate = (updatedExpense: Expense) => {
    mutationUpdate.mutate(updatedExpense);
  };

  // Filtrar gastos basados en la ruta
  const { teamBrokerExpenses, nonTeamBrokerExpenses } = useFilteredExpenses(
    expenses || []
  );

  const filteredExpenses = router.pathname.includes("expensesBroker")
    ? teamBrokerExpenses
    : nonTeamBrokerExpenses;

  const splitTextIntoLines = (text: string, maxLength: number) => {
    const regex = new RegExp(`.{1,${maxLength}}`, "g");
    return text.match(regex) || [];
  };

  if (isLoading) return <Loader />;

  return (
    <div className="bg-white p-4 mt-6 rounded-xl shadow-md pb-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Lista de Gastos</h2>
      {filteredExpenses.length === 0 ? (
        <p className="text-center text-gray-600">No existen gastos</p>
      ) : (
        <>
          <Slider {...settings}>
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="p-4 expense-card">
                <div className="bg-[#5DADE2]/10 text-[#2E86C1] p-4 rounded-xl shadow-md flex flex-col justify-around space-y-4 h-[400px] max-h-[400px] md:h-[300px] md:max-h-[300px]">
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Monto en ARS:</strong> $
                    {formatNumber(expense.amount)}
                  </p>
                  <p>
                    <strong>Monto en Dólares:</strong> $
                    {formatNumber(expense.amountInDollars)}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {expense.expenseType}
                  </p>
                  <p className="text-sm">
                    <strong>Descripción:</strong>
                    {splitTextIntoLines(expense.description, 20).map(
                      (line, index) => (
                        <span key={index}>
                          {line}
                          <br />
                        </span>
                      )
                    )}
                  </p>
                  <div className="flex justify-around">
                    <button
                      onClick={() => handleEditClick(expense)}
                      className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(expense.id)}
                      className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          {isEditModalOpen && selectedExpense && (
            <ExpensesModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              expense={selectedExpense}
              onExpenseUpdate={handleExpenseUpdate} // Pass the update handler
            />
          )}
        </>
      )}
    </div>
  );
};

export default ExpensesListCards;
