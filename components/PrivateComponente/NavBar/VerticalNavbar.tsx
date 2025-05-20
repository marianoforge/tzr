import { useEffect } from 'react';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  TableCellsIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserPlusIcon,
  UsersIcon,
  VideoCameraIcon,
  Cog8ToothIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

import { auth } from '@/lib/firebase';
import { useUserDataStore } from '@/stores/userDataStore';
import { UserActions } from '@/components/PrivateComponente/NavComponents/UserActions';
import { UserRole } from '@/common/enums';

import { NavLink } from '../NavComponents/NavLink';

const VerticalNavbar = () => {
  const { userData, isLoading, fetchItems } = useUserDataStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchItems(user.uid);
      } else {
        console.error('No authenticated user');
      }
    });

    return () => unsubscribe();
  }, [fetchItems]);

  const renderAdminLink = () => {
    if (
      userData?.uid === '8QEPCwamFSYYIPcrhdQUsyZJgup1' ||
      userData?.uid === 'HDDigTYJLhd5xWDG1fwpQzrER4O2'
    ) {
      return (
        <NavLink
          href="/admin-office"
          icon={<Cog8ToothIcon className="w-5 h-5 mr-2 text-lightBlue" />}
          label="Admin"
        />
      );
    }
    return null;
  };

  const renderNavButtons = () => (
    <>
      <NavLink
        href="/dashboard"
        icon={<HomeIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Dashboard"
      />
      <NavLink
        href="https://www.youtube.com/playlist?list=PLDkJwMV1ib37YHUQTgG-0e1b7uNV6lk0C"
        target="_blank"
        icon={<VideoCameraIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Tutoriales"
      />
      <div className="text-lg flex flex-col pt-4 pl-4 pb-2">
        <p>Informes</p>
      </div>
      <NavLink
        href="/operationsList"
        icon={
          <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-lightBlue" />
        }
        label="Operaciones"
      />
      <NavLink
        href="/expensesList"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Gastos"
      />
      <NavLink
        href="/calendar"
        icon={<CalendarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Calendario de Eventos"
      />
      <NavLink
        href="/projections"
        icon={<ChartBarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Proyecciones"
      />
      <div className="text-lg flex flex-col pt-10 pl-4 pb-2">
        <p>Formularios</p>
      </div>
      <NavLink
        href="/reservationInput"
        icon={
          <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-lightBlue" />
        }
        label="Form de Operaciones"
      />
      <NavLink
        href="/expenses"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Form de Gastos"
      />
      <NavLink
        href="/eventForm"
        icon={<TableCellsIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Form de Eventos"
      />
      <NavLink
        href="/expenses-agents-form"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Form de Gastos de Asesores"
      />
    </>
  );

  const renderTeamLeaderNavButtons = () => (
    <>
      {renderNavButtons()}
      <div className="text-lg flex flex-col pt-10 pl-4 pb-2">
        <p>Administración</p>
      </div>
      <NavLink
        href="/team-admin"
        icon={<UsersIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Reporte del Equipo"
      />
      <NavLink
        href="/agents"
        icon={<UserPlusIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Tabla de Asesores"
      />
      <NavLink
        href="/expenses-agents"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Gastos por Asesor"
      />
    </>
  );

  const renderNavLinksBasedOnRole = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // Verificar el rol del usuario
    if (!userData) return renderNavButtons();

    // Render admin link for specific user regardless of role
    const adminLinkForSpecificUser = renderAdminLink();

    if (userData.role === UserRole.TEAM_LEADER_BROKER) {
      return (
        <>
          {adminLinkForSpecificUser}
          {renderTeamLeaderNavButtons()}
        </>
      );
    }

    // Default: mostrar botones estándar
    return (
      <>
        {adminLinkForSpecificUser}
        {renderNavButtons()}
      </>
    );
  };

  return (
    <nav className="h-[calc(100vh-8rem)] text-sm flex-col w-[320px] fixed left-0 top-16 hidden xl:block overflow-y-auto">
      <div className="flex items-center justify-center h-20">
        <Image src="/trackProLogo.png" alt="Logo" width={350} height={350} />
      </div>
      <div className="ml-6 h-[1px] w-64 bg-gray-300"></div>
      <div className="flex flex-col">
        <div className="flex-grow flex flex-col space-y-2 p-4 font-semibold">
          {renderNavLinksBasedOnRole()}
        </div>
        <div className="flex-grow flex flex-col space-y-2 p-4 font-semibold">
          <UserActions />
        </div>
      </div>
    </nav>
  );
};

export default VerticalNavbar;
