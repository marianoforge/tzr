import Dashboard from "@/components/TrackeComponents/Dashboard";
import PrivateLayout from "@/components/TrackeComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackeComponents/PrivateRoute";

const DashboardPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <Dashboard />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default DashboardPage;
