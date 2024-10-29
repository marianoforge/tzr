import { useEffect, useState } from 'react';
import Image from 'next/image';

import { useUserDataStore } from '@/stores/userDataStore';
import { auth } from '@/lib/firebase';
import { NavButton } from '@/components/TrackerComponents/NavComponents/NavButton';
import { UserActions } from '@/components/TrackerComponents/NavComponents/UserActions';
interface NavbarProps {
  setActiveView: (view: string) => void;
}

const Navbar = ({ setActiveView }: NavbarProps) => {
  const { userData, isLoading, fetchUserData } = useUserDataStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        console.error('No authenticated user');
      }
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const renderNavButtons = () => (
    <>
      <NavButton href="/dashboard" label="Dashboard" fullWidth />
      <NavButton href="/calendar" label="Calendario" fullWidth />
      <NavButton href="/operationsList" label="Operaciones" fullWidth />
      <NavButton href="/expensesList" label="Gastos Propios" fullWidth />
      <NavButton
        href="/reservationInput"
        label="Form de Operaciones"
        fullWidth
      />
      <NavButton href="/eventForm" label="Form de Eventos" fullWidth />
      <NavButton href="/expenses" label="Form de Gastos" fullWidth />
    </>
  );

  const renderAdminNavButtons = () => (
    <>
      {renderNavButtons()}
      <NavButton href="/agents" label="Informe Agentes / Asesores" fullWidth />
    </>
  );

  const renderNavLinksBasedOnRole = () => {
    if (isLoading || !userData) return null;

    switch (userData.role) {
      case 'team_leader_broker':
        return renderAdminNavButtons();
      case 'agente_asesor':
        return renderNavButtons();
      default:
        return <NavButton href="/dashboard" label="Dashboard" fullWidth />;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-darkBlue z-50 text-center xl:h-10">
      <div className="flex items-center justify-between w-full mt-4">
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

        {/* Desktop user info */}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="xl:hidden mt-6 mb-6 flex flex-col items-center">
          {renderNavLinksBasedOnRole()}
        </div>
      )}

      <div className="xl:hidden">
        <UserActions setActiveView={setActiveView} />
      </div>
    </nav>
  );
};

export default Navbar;
