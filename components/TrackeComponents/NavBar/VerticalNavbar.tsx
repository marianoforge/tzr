import { useUserDataStore } from "@/stores/userDataStore";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  TableCellsIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { VerticalNavButton } from "@/components/TrackeComponents/NavComponents/VerticalNavButton";
import Image from "next/image";
import { UserActions } from "@/components/TrackeComponents/NavComponents/UserActions";

interface VerticalNavbarProps {
  setActiveView: (view: string) => void;
}

const VerticalNavbar = ({ setActiveView }: VerticalNavbarProps) => {
  const { userData, isLoading, fetchItems } = useUserDataStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchItems(user.uid);
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
        icon={<HomeIcon className="w-5 h-5 mr-2 text-lightBlue" />}
      />
      <div className="text-lg flex flex-col pt-4 pl-4 pb-2">
        <p>Informes</p>
      </div>
      <VerticalNavButton
        onClick={() => handleNavClick("operationsList")}
        label="Operaciones"
        icon={
          <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-lightBlue" />
        }
      />
      <VerticalNavButton
        onClick={() => handleNavClick("expensesList")}
        label="Gastos"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
      />
      <VerticalNavButton
        onClick={() => handleNavClick("calendar")}
        label="Calendario de Eventos"
        icon={<CalendarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
      />
      <div className="text-lg flex flex-col pt-10 pl-4 pb-2">
        <p>Formularios</p>
      </div>
      <VerticalNavButton
        onClick={() => handleNavClick("reservationInput")}
        label="Form de Operaciones"
        icon={
          <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-lightBlue" />
        }
      />
      <VerticalNavButton
        onClick={() => handleNavClick("eventForm")}
        label="Form de Eventos"
        icon={<TableCellsIcon className="w-5 h-5 mr-2 text-lightBlue" />}
      />
      <VerticalNavButton
        onClick={() => handleNavClick("expenses")}
        label="Form de Gastos"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
      />
    </>
  );

  const renderAdminNavButtons = (handleNavClick: (view: string) => void) => (
    <>
      {renderNavButtons(handleNavClick)}
      <div className="text-lg flex flex-col pt-10 pl-4 pb-2">
        <p>Reportes Team / Broker</p>
      </div>
      <VerticalNavButton
        onClick={() => handleNavClick("agents")}
        label="Asesores"
        icon={
          <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-lightBlue" />
        }
      />
      <VerticalNavButton
        onClick={() => handleNavClick("expensesBroker")}
        label="Gastos"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
      />
    </>
  );

  const renderNavLinksBasedOnRole = () => {
    if (isLoading || !userData) return null; // Evita el renderizado hasta que los datos estén disponibles

    switch (userData.role) {
      case "team_leader_broker":
        return renderAdminNavButtons(handleNavClick);
      case "agente_asesor":
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
    <nav className="h-[calc(100vh-4rem)] text-sm flex-col w-[320px] fixed left-0 top-16 hidden xl:block min-h-[900px] overflow-y-auto">
      <div className="flex items-center justify-center h-20 pl-4 ">
        <Image src="/trackProLogo.png" alt="Logo" width={200} height={200} />
      </div>
      <div className="ml-6 h-[1px] w-64 bg-gray-300"></div>
      <div className="flex flex-col">
        <div className="flex-grow flex flex-col space-y-2 p-4 font-semibold">
          {renderNavLinksBasedOnRole()}
        </div>
        <div className="flex-grow flex flex-col space-y-2 p-4 font-semibold">
          <UserActions setActiveView={setActiveView} />
        </div>
      </div>
    </nav>
  );
};

export default VerticalNavbar;