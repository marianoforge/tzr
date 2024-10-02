import React from "react";
import PrivateRoute from "../components/PrivateRoute";
import AgentsReport from "@/components/Agents/AgentsReport";
import PrivateLayout from "@/components/PrivateLayout";
import { useUserDataStore } from "@/stores/userDataStore";
import AgentsReportCarouselDash from "@/components/Agents/AgentsReportCarouselDash";

const Agents = () => {
  const { userData } = useUserDataStore();
  return (
    <PrivateRoute requiredRole="admin">
      <PrivateLayout>
        {userData && (
          <>
            <div className="hidden xl:block">
              {userData && <AgentsReport currentUser={userData} />}
            </div>

            <div className="block xl:hidden">
              {userData && <AgentsReportCarouselDash currentUser={userData} />}
            </div>
          </>
        )}
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default Agents;
