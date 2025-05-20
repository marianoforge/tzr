import { useState } from 'react';
import Image from 'next/image';
import { VideoCameraIcon } from '@heroicons/react/24/outline';

import { useUserDataStore } from '@/stores/userDataStore';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/common/enums';
import { UserActions } from '@/components/PrivateComponente/NavComponents/UserActions';

import { NavButton } from '../NavComponents/NavButton';

const Navbar = () => {
  const { userData, isLoading: isUserDataLoading } = useUserDataStore();
  const { role: authRole } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderNavButtons = () => (
    <>
      <NavButton href="/dashboard" label="Dashboard" />
      <NavButton href="/operationsList" label="Operaciones" />
      <NavButton href="/expensesList" label="Gastos" />
      <NavButton href="/calendar" label="Calendario de Eventos" />
      <NavButton href="/reservationInput" label="Form de Operaciones" />
      <NavButton href="/expenses" label="Form de Gastos" />
      <NavButton href="/eventForm" label="Form de Eventos" />
      <NavButton href="/projections" label="Proyecciones" />
    </>
  );

  const renderAdminNavButtons = () => (
    <>
      {renderNavButtons()}
      <NavButton
        href="/expenses-agents-form"
        label="Form de Gastos de Asesores"
      />
      <NavButton href="/team-admin" label="Admin de Equipo" />
      <NavButton href="/agents" label="Informe Asesores" />
      <NavButton href="/expenses-agents" label="Gastos por Asesor" />
    </>
  );

  const renderNavLinksBasedOnRole = () => {
    // Usar el rol de userData o authRole, lo que esté disponible
    const roleToUse = userData?.role || authRole;

    // Si está cargando y no hay rol disponible, mostrar nada
    if (isUserDataLoading && !roleToUse) return null;

    switch (roleToUse) {
      case UserRole.TEAM_LEADER_BROKER:
        return renderAdminNavButtons();
      case UserRole.AGENTE_ASESOR:
        return renderNavButtons();
      default:
        return <NavButton href="/dashboard" label="Dashboard" fullWidth />;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-darkBlue z-50 text-center xl:h-10">
      <div className="flex items-center justify-between w-full mt-4">
        <div className="hidden xl:flex items-center justify-center w-full -mt-2 ml-[300px] ">
          <a
            href="https://www.youtube.com/playlist?list=PLDkJwMV1ib37YHUQTgG-0e1b7uNV6lk0C"
            target="_blank"
            className="bg-gradient-to-r from-[#FFB7B2]  via-lightBlue bg-clip-text  to-[#ffffff] text-transparent font-semibold hover:underline mr-4"
          >
            NO TE OLVIDES DE VER LOS TUTORIALES{' '}
          </a>
          <VideoCameraIcon className="h-5 w-5 text-white" />
        </div>
        {/* Hamburger menu icon */}
        <div className="xl:hidden pl-12 space-x-3 flex w-1/6">
          <button
            className="text-white focus:outline-none"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
        <div className="hidden lg:block text-xl font-bold w-1/6 h-3 ml-12 bg-darkBlue"></div>
        <div className="pr-4 sm:pr-0 md:pl-10 font-bold w-4/6 xl:hidden">
          <Image
            src="/trackproLogoWhite.png"
            alt="Logo"
            width={250}
            height={250}
          />
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="xl:hidden mt-6 mb-6 flex flex-col items-center">
          {renderNavLinksBasedOnRole()}
        </div>
      )}

      <div className="xl:hidden">
        <UserActions />
      </div>
    </nav>
  );
};

export default Navbar;
