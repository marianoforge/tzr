import React from 'react';

import ProjectionsData from './ProjectionsData';
import ProjectionsActivity from './ProjectionsActivity';
import ProjectionsFunnelChart from './ProjecttionsChart';

import { useAuthStore } from '@/stores/authStore';

const ProjectionsMain = () => {
  const { userID } = useAuthStore();

  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="flex w-full xl:w-3/5">
          <ProjectionsData userId={userID || ''} />
        </div>
        <div className="flex w-full xl:w-2/5">
          <ProjectionsFunnelChart userId={userID || ''} />
        </div>
      </div>
      <ProjectionsActivity />
    </div>
  );
};

export default ProjectionsMain;
