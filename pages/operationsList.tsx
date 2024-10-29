import React from 'react';

import PrivateLayout from '@/components/TrackerComponents/PrivateLayout';
import PrivateRoute from '@/components/TrackerComponents/PrivateRoute';
import OperationsTable from '@/components/TrackerComponents/Operations/OperationsTable';
import OperationsCarousel from '@/components/TrackerComponents/Operations/OperationsCarousel';
import OperationsTableRent from '@/components/TrackerComponents/Operations/OperationsTableRent';

const OperationsPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden lg:flex lg:flex-col lg:gap-10">
          <OperationsTable />
          <OperationsTableRent />
        </div>
        <div className="block lg:hidden">
          <OperationsCarousel />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default OperationsPage;
