import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { UserInfo } from '@/components/PrivateComponente/NavComponents/UserInfo';
import { UserAvatar } from '@/components/PrivateComponente/NavComponents/UserAvatar';
import { useUserDataStore } from '@/stores/userDataStore';
import { useAuthStore } from '@/stores/authStore';

import ChatHelper from '../chatbot/Chatbot';

import Bubbles from './Bubbles';
import CuadroPrincipal from './CuadroPrincipal';
import CuadroPrincipalChart from './CuadroPrincipalChart';
import MonthlyBarChart from './MonthlyBarChart';
import MonthlyBarChartGross from './MonthlyBarChartGross';
import ObjectiveChart from './ObjectiveChart';
import Profitability from './Profitability';
import MonthlyLineChartPoints from './MonthlyLineChartPoints';
import ChartFallenOps from './ChartFallenOps';
import Projections from './Projections';
import Exclusiveness from './Exclusiveness';
import DaysToSell from './DaysToSell';
import TipoInmuebleChart from './TipoInmuebleChart';

const DashBoard = () => {
  const { userData, fetchUserData, isLoading, setUserData } =
    useUserDataStore();
  const { userID, setUserRole } = useAuthStore();

  // Consulta React Query para obtener datos del usuario directamente del API
  const { data: userDataFromQuery, isLoading: isUserQueryLoading } = useQuery({
    queryKey: ['userData', userID],
    queryFn: async () => {
      if (!userID) return null;
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error('User not authenticated');

      const response = await axios.get(`/api/users/${userID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!userID,
    refetchOnWindowFocus: true,
    staleTime: 0, // Siempre obtenemos datos frescos
  });

  // Usar el userData más actualizado (de la consulta o del store)
  const mergedUserData = userDataFromQuery || userData;

  // Cargar datos del usuario si no están disponibles
  useEffect(() => {
    if (userID && !userData && !isLoading) {
      fetchUserData(userID);
    }

    // Si tenemos datos de la consulta, actualizar el store
    if (userDataFromQuery && !isUserQueryLoading) {
      setUserData(userDataFromQuery);
      if (userDataFromQuery.role) {
        setUserRole(userDataFromQuery.role);
      }
    }

    // También guardamos el userUID en localStorage para otros componentes
    if (mergedUserData?.uid) {
      localStorage.setItem('userUID', mergedUserData.uid);
    }
  }, [
    userID,
    userData,
    userDataFromQuery,
    isLoading,
    isUserQueryLoading,
    fetchUserData,
    setUserData,
    setUserRole,
    mergedUserData,
  ]);

  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div className="text-[28px] font-bold hidden h-[64px] xl:flex md:flex-col justify-center pl-4 w-1/2">
          Dashboard Principal
        </div>
        <div className="hidden xl:flex flex-row justify-end items-center gap-2 w-1/2 mr-2">
          <UserAvatar />
          <UserInfo />
          <ChatHelper />
        </div>
      </div>
      <div className="grid grid-cols-1 mt-28 sm:mt-20 xl:mt-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-10 lg:gap-6 mb-6">
        <div className="md:col-span-1 lg:col-span-1 2xl:col-span-4">
          <Bubbles />
        </div>
        <div className="md:col-span-1 mt-8 lg:mt-0 lg:col-span-1 2xl:col-span-3 space-y-8">
          <div className="flex flex-row gap-4">
            <ObjectiveChart />
          </div>

          <Profitability />
        </div>
        <div className="md:col-span-1 mt-10 lg:mt-6 lg:col-span-2 gap-8 xl:gap-8 2xl:col-span-3 2xl:mt-0 flex flex-col justify-between">
          <DaysToSell />
          <Exclusiveness />
        </div>
      </div>
      <div className="space-y-6">
        <div className="hidden lg:block space-y-8">
          <MonthlyLineChartPoints />
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 md:gap-10"
          style={{ marginTop: '2.5rem' }}
        >
          <div className="col-span-1">
            <TipoInmuebleChart />
          </div>
          <div className="col-span-1">
            <CuadroPrincipal />
          </div>

          <div className="col-span-1 space-y-6">
            <CuadroPrincipalChart />
            <ChartFallenOps />
          </div>
        </div>
        <Projections />
        <div style={{ marginTop: '2.5rem' }}>
          <MonthlyBarChart />
        </div>
        <div style={{ marginTop: '2.5rem' }}>
          <MonthlyBarChartGross />
        </div>
      </div>
    </>
  );
};

export default DashBoard;
