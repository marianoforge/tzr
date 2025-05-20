import TeamAdmin from '@/modules/teamAdmin/TeamAdmin';
import PrivateLayout from '@/components/PrivateComponente/PrivateLayout';
import PrivateRoute from '@/components/PrivateComponente/PrivateRoute';
import { UserRole } from '@/common/enums';

const TeamAdminPage = () => {
  return (
    <PrivateRoute requiredRole={UserRole.TEAM_LEADER_BROKER}>
      <PrivateLayout>
        <TeamAdmin />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default TeamAdminPage; 