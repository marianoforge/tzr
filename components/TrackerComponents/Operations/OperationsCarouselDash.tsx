import React from "react";
import OperationsCarousel from "./OperationsCarousel";

export type FilterType = "all" | "open" | "closed" | "currentYear" | "year2023";

interface OperationsCarouselDashProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
}

const OperationsCarouselDash: React.FC<OperationsCarouselDashProps> = ({
  filter,
  setFilter,
}) => {
  return (
    <div className="bg-white p-6 mt-20 rounded-xl shadow-md pb-10 ">
      <OperationsCarousel filter={filter} setFilter={setFilter} />
    </div>
  );
};

export default OperationsCarouselDash;
