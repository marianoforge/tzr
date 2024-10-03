import React from "react";
import OperationsCarousel from "./OperationsCarousel";

interface OperationsCarouselDashProps {
  filter: "all" | "open" | "closed";
  setFilter: React.Dispatch<React.SetStateAction<"all" | "open" | "closed">>;
}

const OperationsCarouselDash: React.FC<OperationsCarouselDashProps> = ({
  filter,
  setFilter,
}) => {
  return (
    <div className="bg-white p-6 mt-6 rounded-xl shadow-md pb-10">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 mx-2 ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Todas las Operaciones
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`px-4 py-2 mx-2 ${
            filter === "open" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Operaciones Abiertas
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-4 py-2 mx-2 ${
            filter === "closed" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Operaciones Cerradas
        </button>
      </div>
      <OperationsCarousel filter={filter} />
    </div>
  );
};

export default OperationsCarouselDash;
