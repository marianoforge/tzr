import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";
import Settings from "@/components/TrackerComponents/Settings";
import React from "react";

const SettingsPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <Settings />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default SettingsPage;
