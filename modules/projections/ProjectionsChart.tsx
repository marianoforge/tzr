'use client';

import React, { useState, useEffect } from 'react';
import { FunnelChart, Funnel, Tooltip, LabelList } from 'recharts';
import { useQuery } from '@tanstack/react-query';

import { WeekData } from './ProjectionsModal';

import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';

const fetchWeeks = async (userId: string) => {
  const response = await fetch(`/api/getWeeks?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch weeks');
  return response.json();
};

const ProjectionsFunnelChart = ({ userId }: { userId: string }) => {
  const {
    data: weeks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['weeks', userId],
    queryFn: () => fetchWeeks(userId),
  });
  // Calculate totals for the funnel
  const funnelData = [
    {
      name: 'Prospección & Contactos Referidos',
      value: weeks.reduce(
        (sum: number, week: WeekData) =>
          sum +
          (parseFloat(week.actividadVerde || '0') +
            parseFloat(week.contactosReferidos || '0')),
        0
      ),
      fill: '#8884d8',
    },
    {
      name: 'Pre-Buying & Pre-Listing',
      value: weeks.reduce(
        (sum: number, week: WeekData) =>
          sum +
          (parseFloat(week.preBuying || '0') +
            parseFloat(week.preListing || '0')),
        0
      ),
      fill: '#83a6ed',
    },
    {
      name: 'Captaciones',
      value: weeks.reduce(
        (sum: number, week: WeekData) =>
          sum + parseFloat(week.captaciones || '0'),
        0
      ),
      fill: '#8dd1e1',
    },
    {
      name: 'Reservas',
      value: weeks.reduce(
        (sum: number, week: WeekData) => sum + parseFloat(week.reservas || '0'),
        0
      ),
      fill: '#82ca9d',
    },
    {
      name: 'Cierres',
      value: weeks.reduce(
        (sum: number, week: WeekData) => sum + parseFloat(week.cierres || '0'),
        0
      ),
      fill: '#a4de6c',
    },
  ];

  const [chartDimensions, setChartDimensions] = useState({
    width: 600,
    height: 600,
  });

  useEffect(() => {
    const updateChartDimensions = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 1700) {
        setChartDimensions({ width: 400, height: 400 });
      }

      if (screenWidth < 1280) {
        setChartDimensions({ width: 600, height: 600 });
      }

      if (screenWidth > 1700) {
        setChartDimensions({ width: 600, height: 600 });
      }
    };

    updateChartDimensions();
    window.addEventListener('resize', updateChartDimensions);

    return () => {
      window.removeEventListener('resize', updateChartDimensions);
    };
  }, []);

  const { width, height } = chartDimensions;

  if (isLoading) {
    return (
      <div className="w-full">
        <SkeletonLoader height={60} count={10} />
      </div>
    );
  }
  if (error) return <p>Error al cargar datos del funnel.</p>;

  return (
    <div className="bg-white p-4 gap-4 rounded-xl shadow-md flex flex-col justify-center items-center w-full">
      <h2 className="text-xl font-bold">Funnel de Proyección</h2>
      <FunnelChart width={width} height={height}>
        <Tooltip />
        <Funnel dataKey="value" data={funnelData} isAnimationActive>
          <LabelList
            position="center"
            fill="#1f2937"
            stroke="none"
            dataKey="name"
            className="font-semibold text-xs"
          />
        </Funnel>
      </FunnelChart>
    </div>
  );
};

export default ProjectionsFunnelChart;
