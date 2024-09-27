import React from "react";
import CuadroPrincipal from "@/components/CuadroPrincipal";
import PrivateRoute from "../components/PrivateRoute";
import PrivateLayout from "@/components/PrivateLayout";
import OperationsList from "@/components/OperationsList";
import CuadroPrincipalChart from "@/components/CuadroPrincipalChart";
import Bubbles from "@/components/Bubbles";
import EventsList from "@/components/EventsList";
import MonthlyMockedBarchart from "@/components/MonthlyMockedBarchart";
import ObjectiveChart from "./ObjectiveChart";

const DashBoard = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className=" md:p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-10 gap-4 lg:gap-6 mb-6">
            <div className="md:col-span-2 lg:col-span-1 2xl:col-span-4">
              <Bubbles />
            </div>
            <div className="md:col-span-2 lg:col-span-1 2xl:col-span-3">
              <ObjectiveChart />
            </div>
            <div className="md:col-span-2 lg:col-span-2 2xl:col-span-3">
              <EventsList />
            </div>
          </div>

          <div className="space-y-6">
            <div className="hidden md:block">
              <OperationsList />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
              <CuadroPrincipal />
              <CuadroPrincipalChart />
            </div>
            {/* Sacar el Mocked */}
            <MonthlyMockedBarchart />
          </div>
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default DashBoard;
