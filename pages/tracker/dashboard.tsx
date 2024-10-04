import Dashboard from "@/components/TrackerComponents/Dashboard";
import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";

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
