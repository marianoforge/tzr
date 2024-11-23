import React from 'react';

import PrivateLayout from '@/components/PrivateComponente/PrivateLayout';
import PrivateRoute from '@/components/PrivateComponente/PrivateRoute';
import ProjectionsMain from '@/modules/projections/ProjectionsMain';

const ProjectionsPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="hidden md:flex md:flex-col md:gap-10">
          <ProjectionsMain />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ProjectionsPage;
