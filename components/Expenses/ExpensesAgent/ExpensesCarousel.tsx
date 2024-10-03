import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { formatNumber } from "@/utils/formatNumber";
import { Expense } from "@/types"; // Asegúrate de que la ruta sea correcta
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useExpensesStore } from "@/stores/useExpensesStore";
import { useRouter } from "next/router";
import Loader from "../../Loader";
import ExpensesModal from "./ExpensesModal"; // Adjust the path as necessary
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import useFilteredExpenses from "@/hooks/useFilteredExpenses";

const ExpensesCarousel: React.FC<{ expenses: Expense[] }> = ({ expenses }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const { setExpenses, calculateTotals, isLoading } = useExpensesStore();
  const { teamBrokerExpenses, nonTeamBrokerExpenses } =
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
      )
    );
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
      setExpenses(expenses.filter((expense) => expense.id !== id));
      calculateTotals();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const splitTextIntoLines = (text: string, maxLength: number) => {
    const regex = new RegExp(`.{1,${maxLength}}`, "g");
    return text.match(regex) || [];
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

  return isLoading ? (
    <Loader />
  ) : (
    <>
      <Slider {...settings}>
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="p-4 expense-card">
            <div className="bg-[#5DADE2]/10 text-[#2E86C1] p-4 rounded-xl shadow-md flex flex-col justify-around space-y-4 h-[400px] max-h-[400px] md:h-[300px]   md:max-h-[300px]">
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(expense.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Monto en ARS:</strong> ${formatNumber(expense.amount)}
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
          onExpenseUpdate={handleExpenseUpdate}
        />
      )}
    </>
  );
};

export default ExpensesCarousel;
