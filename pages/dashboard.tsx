// pages/dashboard.tsx
import PrivateRoute from '../components/PrivateRoute';
import PrivateLayout from '@/components/PrivateLayout';

const Dashboard = () => {
  return (
    <PrivateRoute>
     <PrivateLayout>
      <div className="p-2">
        <h1>DashBoard</h1>
      </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default Dashboard;
