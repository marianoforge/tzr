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
} from "@heroicons/react/24/outline";
import { VerticalNavButton } from "./NavComponents/VerticalNavButton";

interface VerticalNavbarProps {
  setActiveView: (view: string) => void;
}

const VerticalNavbar = ({ setActiveView }: VerticalNavbarProps) => {
  const { fetchUserData } = useUserDataStore();

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

  const handleNavClick = (view: string) => {
    setActiveView(view);
  };

  return (
    <nav className="bg-[#184d6b] h-[calc(100vh-4rem)]  flex-col w-64 fixed left-0 top-16 shadow-md hidden lg:block overflow-y-auto">
      <div className="flex flex-col">
        <div className="flex-grow flex flex-col space-y-2 p-4 font-semibold">
          <VerticalNavButton
            onClick={() => handleNavClick("dashboard")}
            label="Dashboard"
            icon={<HomeIcon className="w-5 h-5 mr-2" />}
          />
          <VerticalNavButton
            onClick={() => handleNavClick("operationsList")}
            label="Operaciones"
            icon={<ClipboardDocumentListIcon className="w-5 h-5 mr-2" />} // Cambiado el icono
          />
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
            onClick={() => handleNavClick("calendar")}
            label="Calendario"
            icon={<CalendarIcon className="w-5 h-5 mr-2" />}
          />
        </div>
      </div>
      <div className="px-8">
        <UserActions setActiveView={setActiveView} />
      </div>
    </nav>
  );
};

// Definir la interfaz VerticalNavButtonProps y el componente VerticalNavButton

export default VerticalNavbar;
