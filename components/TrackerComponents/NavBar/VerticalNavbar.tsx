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
import Image from "next/image";
import { UserActions } from "@/components/TrackerComponents/NavComponents/UserActions";
import { NavLink } from "../NavComponents/NavLink";

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

  const renderNavButtons = () => (
    <>
      <NavLink
        href="/dashboard"
        icon={<HomeIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Dashboard"
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
        href="/eventForm"
        icon={<TableCellsIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Form de Eventos"
      />
      <NavLink
        href="/expenses"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Form de Gastos"
      />
    </>
  );

  const renderAdminNavButtons = () => (
    <>
      {renderNavButtons()}
      <div className="text-lg flex flex-col pt-10 pl-4 pb-2">
        <p>Reportes Team / Broker</p>
      </div>
      <NavLink
        href="/agents"
        icon={
          <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-lightBlue" />
        }
        label="Asesores"
      />
      <NavLink
        href="/expensesBroker"
        icon={<CurrencyDollarIcon className="w-5 h-5 mr-2 text-lightBlue" />}
        label="Gastos"
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
        return (
          <NavLink
            href="/dashboard"
            icon={<HomeIcon className="w-5 h-5 mr-2" />}
            label="Dashboard"
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