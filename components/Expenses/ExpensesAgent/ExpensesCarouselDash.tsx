import React from "react";
import Loader from "../../Loader";
import ExpensesCarousel from "./ExpensesCarousel";
import { useExpensesStore } from "@/stores/useExpensesStore";

const ExpensesCarouselDash: React.FC = () => {
  const { expenses, isLoading } = useExpensesStore();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-6 mt-6 rounded-lg shadow-md pb-10">
      <h2 className="text-2xl font-bold mb-2 text-center">Lista de Gastos</h2>
      {expenses.length === 0 ? (
        <p className="text-center text-gray-600">No existen operaciones</p>
      ) : (
        <ExpensesCarousel expenses={expenses} />
      )}
    </div>
  );
};

export default ExpensesCarouselDash;
