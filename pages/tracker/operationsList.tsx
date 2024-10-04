import PrivateLayout from "@/components/TrackeComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackeComponents/PrivateRoute";
import React, { useState } from "react";
import OperationsList from "@/components/TrackeComponents/Operations/OperationsList";
import OperationsCarouselDash from "@/components/TrackeComponents/Operations/OperationsCarouselDash";

const OperationsPage = () => {
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden xl:block">
          <OperationsList filter={filter} setFilter={setFilter} />
        </div>
        <div className="block xl:hidden">
          <OperationsCarouselDash filter={filter} setFilter={setFilter} />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default OperationsPage;
