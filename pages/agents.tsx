import React from 'react';

import AgentsReport from '@/modules/agents/AgentsReport';
import { useUserDataStore } from '@/stores/userDataStore';
import AgentsReportCarousel from '@/modules/agents/AgentsReportCarousel';
import AgentsReportByOps from '@/modules/agents/AgentsReportByOps';
import PrivateRoute from '@/components/PrivateComponente/PrivateRoute';
import PrivateLayout from '@/components/PrivateComponente/PrivateLayout';
import { UserRole } from '@/common/enums';

const Agents = () => {
  const { userData } = useUserDataStore();
  return (
    <PrivateRoute requiredRole={UserRole.TEAM_LEADER_BROKER}>
      <PrivateLayout>
        {userData && (
          <>
            <div className="hidden lg:block">
              {userData && <AgentsReport currentUser={userData} />}
            </div>
            <div className="hidden lg:block">
              {userData && <AgentsReportByOps currentUser={userData} />}
            </div>

            <div className="block lg:hidden">
              {userData && <AgentsReportCarousel currentUser={userData} />}
            </div>
          </>
        )}
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default Agents;
