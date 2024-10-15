import { useEffect, useState } from "react";
import { useUserDataStore } from "@/stores/userDataStore";
import { auth } from "@/lib/firebase";
import { NavButton } from "@/components/TrackerComponents/NavComponents/NavButton";
import { UserActions } from "@/components/TrackerComponents/NavComponents/UserActions";

interface NavbarProps {
  setActiveView: (view: string) => void;
}

const Navbar = ({ setActiveView }: NavbarProps) => {
  const { userData, isLoading, fetchUserData } = useUserDataStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null); // Estado para almacenar los días restantes

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

  useEffect(() => {
    if (userData && userData.trialEndsAt) {
      // Verificar si trialEndsAt es un Firestore Timestamp o una fecha nativa
      let trialEndDate;

      if (userData.trialEndsAt && "toDate" in userData.trialEndsAt) {
        trialEndDate = userData.trialEndsAt.toDate(); // Si es Timestamp de Firestore
      } else {
        trialEndDate = new Date(userData.trialEndsAt); // Si es un Date nativo o string ISO
      }

      // Calcular los días restantes
      const currentDate = new Date();
      const diffTime = trialEndDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convertir milisegundos a días

      setDaysLeft(diffDays >= 0 ? diffDays : 0); // Si la fecha ha pasado, mostrar 0 días
    }
  }, [userData]);

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
    <nav className="fixed top-0 left-0 right-0  bg-darkBlue z-50 text-center">
      {/* Mostrar los días de prueba restantes */}
      <p className="text-white text-sm pt-2 font-semibold">
        {daysLeft !== null
          ? `Te quedan ${daysLeft} días de prueba de Realtor Track Pro Agent - Comprar Licencia`
          : "Bienvenido a Realtor Track Pro"}
      </p>

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
          <div className="text-white text-xl font-bold w-full">TRACKPRO</div>
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
