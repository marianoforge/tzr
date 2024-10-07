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
    <div className="bg-white p-6 mt-12 rounded-xl shadow-md pb-10 ">
      <OperationsCarousel filter={filter} setFilter={setFilter} />
    </div>
  );
};

export default OperationsCarouselDash;
