import { useUserDataStore } from "@/stores/userDataStore";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { UserActions } from "./NavComponents/UserActions";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  TableCellsIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { VerticalNavButton } from "./NavComponents/VerticalNavButton";

interface VerticalNavbarProps {
  setActiveView: (view: string) => void;
}

const VerticalNavbar = ({ setActiveView }: VerticalNavbarProps) => {
  const { userData, isLoading, fetchItems } = useUserDataStore(); // Cambiar fetchUserData a fetchItems

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchItems(user.uid); // Cambiar fetchUserData a fetchItems
      } else {
        console.log("No authenticated user");
      }
    });

    return () => unsubscribe();
  }, [fetchItems]);

  const handleNavClick = (view: string) => {
    setActiveView(view);
  };

  const renderNavButtons = (handleNavClick: (view: string) => void) => (
    <>
      <VerticalNavButton
        onClick={() => handleNavClick("dashboard")}
        label="Dashboard"
        icon={<HomeIcon className="w-5 h-5 mr-2" />}
      />
      <div className="text-white text-lg flex flex-col pt-4 pl-4 pb-2">
        <p>Informes</p>
      </div>
      <VerticalNavButton
        onClick={() => handleNavClick("operationsList")}
        label="Operaciones"
        icon={<ClipboardDocumentListIcon className="w-5 h-5 mr-2" />}
      />
      <VerticalNavButton
        onClick={() => handleNavClick("expensesList")}
        label="Gastos"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2" />}
      />
      <VerticalNavButton
        onClick={() => handleNavClick("calendar")}
        label="Calendario de Eventos"
        icon={<CalendarIcon className="w-5 h-5 mr-2" />}
      />
      <div className="text-white text-lg flex flex-col pt-10 pl-4 pb-2">
        <p>Formularios</p>
      </div>
      <VerticalNavButton
        onClick={() => handleNavClick("reservationInput")}
        label="Form de Operaciones"
        icon={<ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />}
      />
      <VerticalNavButton
        onClick={() => handleNavClick("eventForm")}
        label="Form de Eventos"
        icon={<TableCellsIcon className="w-5 h-5 mr-2" />}
      />
      <VerticalNavButton
        onClick={() => handleNavClick("expenses")}
        label="Form de Gastos"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2" />}
      />
    </>
  );

  const renderAdminNavButtons = (handleNavClick: (view: string) => void) => (
    <>
      {renderNavButtons(handleNavClick)}
      <div className="text-white text-lg flex flex-col pt-10 pl-4 pb-2">
        <p>Informes Agencia</p>
      </div>
      <VerticalNavButton
        onClick={() => handleNavClick("agents")}
        label="Reporte de Asesores"
        icon={<ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />}
      />
    </>
  );

  const renderNavLinksBasedOnRole = () => {
    if (isLoading || !userData) return null; // Evita el renderizado hasta que los datos estén disponibles

    switch (userData.role) {
      case "admin":
        return renderAdminNavButtons(handleNavClick);
      case "user":
        return renderNavButtons(handleNavClick);
      default:
        return (
          <VerticalNavButton
            onClick={() => handleNavClick("dashboard")}
            label="Dashboard"
            icon={<HomeIcon className="w-5 h-5 mr-2" />}
          />
        );
    }
  };

  return (
    <nav className="bg-[#184d6b] h-[calc(100vh-4rem)]  flex-col w-64 fixed left-0 top-16 shadow-md hidden lg:block overflow-y-auto">
      <div className="flex flex-col">
        <div className="flex-grow flex flex-col space-y-2 p-4 font-semibold">
          {renderNavLinksBasedOnRole()}
        </div>
      </div>
      <div className="px-8">
        <UserActions setActiveView={setActiveView} />
      </div>
    </nav>
  );
};

export default VerticalNavbar;
