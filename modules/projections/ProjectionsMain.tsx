import React from 'react';

import ProjectionsData from './ProjectionsData';
import ProjectionsActivity from './ProjectionsActivity';
import ProjectionsFunnelChart from './ProjectionsChart';

import { useAuthStore } from '@/stores/authStore';

const ProjectionsMain = () => {
  const { userID } = useAuthStore();

  return (
    <div className="max-w-[1800px] mx-auto">
      <div
        className="bg-white p-4 gap-4 rounded-xl shadow-md flex flex-col justify-center items-center 
      w-full text-center text-sm text-mediumBlue mt-20 mb-10 px-10"
      >
        Esta sección tiene el objetivo de ayudar al asesor inmobiliario a
        proyectar sus ventas y actividades para el año. De acuerdo a los datos
        ingresados, se calculará el volumen a facturar, el total de puntas o
        cierres, el total de pre listings y el total de puntas semanales para
        que el asesor pueda visualizar su proyección de ventas y actividades. La
        tabla de la parte inferior muestra la efectividad de las operaciones
        cerradas por semana para darle seguimiento a su evolución.
      </div>
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
