import React from "react";
import { useOperationsStore } from "@/stores/useOperationsStore";
import Loader from "../Loader";
import OperationsCarousel from "./OperationsCarousel";

const OperationsCarouselDash: React.FC = () => {
  const { operations, isLoading } = useOperationsStore();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-6 mt-6 rounded-lg shadow-md pb-10">
      <h2 className="text-2xl font-bold mb-2 text-center">
        Lista de Operaciones
      </h2>
      {operations.length === 0 ? (
        <p className="text-center text-gray-600">No existen operaciones</p>
      ) : (
        <OperationsCarousel operations={operations} />
      )}
    </div>
  );
};

export default OperationsCarouselDash;
