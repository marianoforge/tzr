// pages/dashboard.tsx
import CuadroPrincipal from "@/components/CuadroPrincipal";
import PrivateRoute from "../components/PrivateRoute";
import PrivateLayout from "@/components/PrivateLayout";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import OperationsList from "@/components/OperationsList";
import CuadroPrincipalChart from "@/components/CuadroPrincipalChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import Bubbles from "@/components/Bubbles";
import EventCalendar from "@/components/EventCalendar";
import EventsList from "@/components/EventsList";

const Dashboard = () => {
  const [userID, setUserID] = useState<string | null>(null);

  // Get the authenticated user's ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserID(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  if (!userID) {
    return <p>Loading user information...</p>; // Optional loading state or redirect
  }

  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="p-2">
          {/* <h1 className="text-2xl font-bold mb-6">DashBoard</h1> */}
          <div className="flex gap-6 justify-between">
            <div className="w-[40%]">
              <Bubbles />
            </div>
            <div className="w-[20%]">
              <EventCalendar />
            </div>
            <div className="w-[40%]">
              <EventsList />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div className="hidden md:block">
              <OperationsList userID={userID} />
            </div>
            <div className="flex flex-col md:flex-row justify-evenly gap-6">
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
