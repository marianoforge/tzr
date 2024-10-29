import React from 'react';

import PrivateLayout from '@/components/PrivateComponente/PrivateLayout';
import PrivateRoute from '@/components/PrivateComponente/PrivateRoute';
import OperationsTable from '@/modules/operations/OperationsTable';
import OperationsCarousel from '@/modules/operations/OperationsCarousel';
import OperationsTableRent from '@/modules/operations/OperationsTableRent';

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
