import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";
import React, { useState } from "react";
import OperationsList from "@/components/TrackerComponents/Operations/OperationsList";
import OperationsCarouselDash from "@/components/TrackerComponents/Operations/OperationsCarouselDash";

const OperationsPage = () => {
  const [filter, setFilter] = useState<
    "all" | "open" | "closed" | "currentYear" | "year2023"
  >("all");

  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden lg:block">
          <OperationsList filter={filter} setFilter={setFilter} />
        </div>
        <div className="block lg:hidden">
          <OperationsCarouselDash filter={filter} setFilter={setFilter} />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default OperationsPage;
