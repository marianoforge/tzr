import React from "react";
import PrivateRoute from "../components/PrivateRoute";
import AgentsReport from "@/components/Agents/AgentsReport";
import PrivateLayout from "@/components/PrivateLayout";
import { useUserDataStore } from "@/stores/userDataStore";

const Agents = () => {
  const { userData } = useUserDataStore();
  return (
    <PrivateRoute requiredRole="admin">
      <PrivateLayout>
        <AgentsReport currentUser={userData} />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default Agents;
