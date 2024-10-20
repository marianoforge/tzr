import { useEffect, useState } from "react";
import { useUserDataStore } from "@/stores/userDataStore";
import { auth } from "@/lib/firebase";
import { NavButton } from "@/components/TrackerComponents/NavComponents/NavButton";
import { UserActions } from "@/components/TrackerComponents/NavComponents/UserActions";
import useTrialDaysLeft from "@/hooks/useTrialDaysLeft";

interface NavbarProps {
  setActiveView: (view: string) => void;
}

const Navbar = ({ setActiveView }: NavbarProps) => {
  const { userData, isLoading, fetchUserData } = useUserDataStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const daysLeft = useTrialDaysLeft(userData);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        console.log("No authenticated user");
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
      <NavButton href="/expensesList" label="Gastos" fullWidth />
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
      <NavButton
        href="/expensesBroker"
        label="Gastos Team / Broker"
        fullWidth
      />
    </>
  );

  const renderNavLinksBasedOnRole = () => {
    if (isLoading || !userData) return null;

    switch (userData.role) {
      case "team_leader_broker":
        return renderAdminNavButtons();
      case "agente_asesor":
        return renderNavButtons();
      default:
        return <NavButton href="/dashboard" label="Dashboard" fullWidth />;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-darkBlue z-50 text-center">
      <div className="flex items-center justify-center h-4 pt-6">
        <p className="text-white text-sm font-semibold">
          {daysLeft !== 0
            ? `Te quedan ${daysLeft} días de prueba de Realtor Track Pro Agent - Comprar Licencia`
            : "Bienvenido a Realtor Trackpro"}
        </p>
      </div>

      <div className="flex items-center justify-between w-full mt-4">
        {/* Hamburger menu icon */}
        <div className="xl:hidden ml-3 sm:ml-4 md:ml-10 space-x-3 flex">
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
          <div className="text-white text-xl font-bold lg:w-[150px] pb-1">
            {/* <Image
              src="/trackProLogo.png"
              alt="Logo"
              width={350}
              height={350}
            /> */}
            realtor trackpro
          </div>
        </div>

        {/* Desktop user info */}
        <div className="hidden lg:block text-xl font-bold w-full h-3 ml-12 bg-darkBlue"></div>
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
