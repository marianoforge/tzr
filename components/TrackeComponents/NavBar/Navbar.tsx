import { useEffect, useState } from "react";
import { useUserDataStore } from "@/stores/userDataStore";
import { auth } from "@/lib/firebase";
import { NavButton } from "@/components/TrackeComponents/NavComponents/NavButton";
import { UserActions } from "@/components/TrackeComponents/NavComponents/UserActions";

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
        console.log("No authenticated user");
      }
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setIsMenuOpen(false);
  };

  const renderNavButtons = (handleNavClick: (view: string) => void) => (
    <>
      <NavButton
        onClick={() => handleNavClick("dashboard")}
        label="Dashboard"
        fullWidth
      />
      <NavButton
        onClick={() => handleNavClick("calendar")}
        label="Calendario"
        fullWidth
      />
      <NavButton
        onClick={() => handleNavClick("operationsList")}
        label="Operaciones"
        fullWidth
      />
      <NavButton
        onClick={() => handleNavClick("expensesList")}
        label="Gastos"
        fullWidth
      />
      <NavButton
        onClick={() => handleNavClick("reservationInput")}
        label="Form de Operaciones"
        fullWidth
      />
      <NavButton
        onClick={() => handleNavClick("eventForm")}
        label="Form de Eventos"
        fullWidth
      />
      <NavButton
        onClick={() => handleNavClick("expenses")}
        label="Form de Gastos"
        fullWidth
      />
    </>
  );

  const renderAdminNavButtons = (handleNavClick: (view: string) => void) => (
    <>
      {renderNavButtons(handleNavClick)}
      <NavButton
        onClick={() => handleNavClick("agents")}
        label="Informe Agentes / Asesores"
        fullWidth
      />
      <NavButton
        onClick={() => handleNavClick("expensesBroker")}
        label="Gastos Team / Broker"
        fullWidth
      />
    </>
  );

  const renderNavLinksBasedOnRole = () => {
    if (isLoading || !userData) return null; // Avoid rendering links until data is available

    switch (userData.role) {
      case "team_leader_broker":
        return renderAdminNavButtons(handleNavClick);
      case "agente_asesor":
        return renderNavButtons(handleNavClick);
      default:
        return (
          <NavButton
            onClick={() => handleNavClick("dashboard")}
            label="Dashboard"
            fullWidth
          />
        );
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 p-4 bg-darkBlue z-50">
      <div className="flex items-center justify-between w-full">
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
          <div className=" text-white text-xl font-bold w-full">TRACKPRO</div>
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