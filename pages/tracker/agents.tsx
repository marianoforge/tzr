import React from "react";
import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";
import AgentsReport from "@/components/TrackerComponents/Agents/AgentsReport";
import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import { useUserDataStore } from "@/stores/userDataStore";
import AgentsReportCarouselDash from "@/components/TrackerComponents/Agents/AgentsReportCarouselDash";

const Agents = () => {
  const { userData } = useUserDataStore();
  return (
    <PrivateRoute requiredRole="team_leader_broker">
      <PrivateLayout>
        {userData && (
          <>
            <div className="hidden lg:block">
              {userData && <AgentsReport currentUser={userData} />}
            </div>

            <div className="block lg:hidden">
              {userData && <AgentsReportCarouselDash currentUser={userData} />}
            </div>
          </>
        )}
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default Agents;
