import React from "react";
import PrivateRoute from "../components/PrivateRoute";
import AgentsReport from "@/components/AgentsReport";
import PrivateLayout from "@/components/PrivateLayout";

const Agents = () => {
  return (
    <PrivateRoute requiredRole="admin">
      <PrivateLayout>
        <AgentsReport />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default Agents;
