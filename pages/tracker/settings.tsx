import React from 'react';

import PrivateLayout from '@/components/TrackerComponents/PrivateLayout';
import PrivateRoute from '@/components/TrackerComponents/PrivateRoute';
import Settings from '@/components/TrackerComponents/Settings';

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
