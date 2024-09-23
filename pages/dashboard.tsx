// pages/dashboard.tsx
import CuadroPrincipal from "@/components/CuadroPrincipal";
import PrivateRoute from "../components/PrivateRoute";
import PrivateLayout from "@/components/PrivateLayout";

const Dashboard = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="p-2">
          <h1>DashBoard</h1>
          <CuadroPrincipal />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default Dashboard;
