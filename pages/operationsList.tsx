import PrivateLayout from "@/components/PrivateLayout";
import PrivateRoute from "@/components/PrivateRoute";
import React from "react";
import OperationsList from "@/components/Operations/OperationsList";
import OperationsCarouselDash from "@/components/Operations/OperationsCarouselDash";
const operationsList = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden xl:block">
          <OperationsList />
        </div>
        <div className="block xl:hidden">
          <OperationsCarouselDash />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default operationsList;