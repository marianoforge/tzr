import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";
import React, { useState } from "react";
import OperationsList from "@/components/TrackerComponents/Operations/OperationsList";

const OperationsPage = () => {
  const [filter] = useState<
    "all" | "open" | "closed" | "currentYear" | "year2023"
  >("all");

  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden lg:block">
          <OperationsList filter={filter} />
        </div>
        {/* <div className="block lg:hidden">
          <OperationsCarouselDash filter={filter} setFilter={setFilter} />
        </div> */}
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default OperationsPage;
