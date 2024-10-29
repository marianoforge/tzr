import { getDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Dashboard from '@/components/TrackerComponents/Dashboard';
import PrivateLayout from '@/components/TrackerComponents/PrivateLayout';
import PrivateRoute from '@/components/TrackerComponents/PrivateRoute';
import { auth, db } from '@/lib/firebase';

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
