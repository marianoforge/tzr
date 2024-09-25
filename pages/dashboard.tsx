// pages/dashboard.tsx
import CuadroPrincipal from "@/components/CuadroPrincipal";
import PrivateRoute from "../components/PrivateRoute";
import PrivateLayout from "@/components/PrivateLayout";
import OperationsList from "@/components/OperationsList";
import CuadroPrincipalChart from "@/components/CuadroPrincipalChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import Bubbles from "@/components/Bubbles";
import EventCalendar from "@/components/EventCalendar";
import EventsList from "@/components/EventsList";
import { useUserStore } from "@/stores/authStore";
import { useEffect } from "react";

const Dashboard = () => {
  const { userID, initializeAuthListener } = useUserStore();

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe();
  }, [initializeAuthListener]);

  if (!userID) {
    return <p>Loading user information...</p>; // Optional loading state or redirect
  }

  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="p-2 md:p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-10 gap-4 lg:gap-6 mb-6">
            <div className="md:col-span-2 lg:col-span-1 2xl:col-span-4">
              <Bubbles />
            </div>
            <div className="md:col-span-2 lg:col-span-1 2xl:col-span-3">
              <EventCalendar />
            </div>
            <div className="md:col-span-2 lg:col-span-2 2xl:col-span-3">
              <EventsList />
            </div>
          </div>

          <div className="space-y-6">
            <div className="hidden md:block">
              <OperationsList userID={userID} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CuadroPrincipal userID={userID} />
              <CuadroPrincipalChart userID={userID} />
            </div>
            <MonthlyBarChart userID={userID} />
          </div>
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default Dashboard;
