import React from 'react';

import PrivateLayout from '@/components/PrivateComponente/PrivateLayout';
import PrivateRoute from '@/components/PrivateComponente/PrivateRoute';
import ProyectionsMain from '@/modules/proyections/ProyectionsMain';

const ProyectionsPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden lg:flex lg:flex-col lg:gap-10">
          <ProyectionsMain />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ProyectionsPage;
