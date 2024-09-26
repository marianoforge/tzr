import { UserData, useUserDataStore } from "@/stores/userDataStore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

interface NavbarProps {
  setActiveView: (view: string) => void;
}

const Navbar = ({ setActiveView }: NavbarProps) => {
  const { userData, isLoading, error, fetchUserData } = useUserDataStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User authenticated, fetching data for UID:", user.uid);
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

  return (
    <nav className="bg-[#4D8EB3] p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">
          Realtor Efficiency App
        </div>

        {/* Hamburger menu icon */}
        <button
          className="lg:hidden text-white focus:outline-none"
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

        {/* Desktop menu */}
        <div className="hidden lg:flex space-x-4 items-center justify-center">
          <NavButton
            onClick={() => handleNavClick("dashboard")}
            label="Dashboard"
          />
          <NavButton
            onClick={() => handleNavClick("reservationInput")}
            label="Formulario de Operaciones"
          />
          <NavButton
            onClick={() => handleNavClick("eventForm")}
            label="Formulario de Eventos"
          />
          <NavButton
            onClick={() => handleNavClick("calendar")}
            label="Calendario"
          />
        </div>

        {/* User info and actions */}
        <div className="hidden lg:flex items-center space-x-2">
          <UserAvatar />
          <div className="flex flex-col 2xl:items-start">
            <UserInfo userData={userData} isLoading={isLoading} error={error} />
            <UserActions setActiveView={setActiveView} />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <>
          <div className="mt-6 flex flex-col items-center gap-2">
            <UserAvatar />
            <UserInfo userData={userData} isLoading={isLoading} error={error} />
            <UserActions setActiveView={setActiveView} />
          </div>
          <div className="lg:hidden mt-6 mb-6 flex flex-col items-center">
            <NavButton
              onClick={() => handleNavClick("dashboard")}
              label="Dashboard"
              fullWidth
            />
            <NavButton
              onClick={() => handleNavClick("reservationInput")}
              label="Formulario de Operaciones"
              fullWidth
            />
            <NavButton
              onClick={() => handleNavClick("eventForm")}
              label="Formulario de Eventos"
              fullWidth
            />
            <NavButton
              onClick={() => handleNavClick("calendar")}
              label="Calendario"
              fullWidth
            />
          </div>
        </>
      )}
    </nav>
  );
};

interface NavButtonProps {
  onClick: () => void;
  label: string;
  fullWidth?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  onClick,
  label,
  fullWidth = false,
}) => (
  <button
    onClick={onClick}
    className={`text-white hover:bg-[#3A6D8A] px-3 py-2 rounded transition duration-150 ease-in-out ${
      fullWidth ? "w-full text-center" : ""
    }`}
  >
    {label}
  </button>
);

const UserAvatar = () => (
  <div className="w-10 h-10 bg-white rounded-full overflow-hidden">
    <Image
      src="/avatar.jpg"
      alt="User Avatar"
      width={40}
      height={40}
      className="object-cover"
    />
  </div>
);

interface UserInfoProps {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
}

const UserInfo: React.FC<UserInfoProps> = ({ userData, isLoading, error }) => (
  <div className="flex flex-col items-start">
    {isLoading ? (
      <p className="text-white font-bold">Cargando...</p>
    ) : error ? (
      <p className="text-white font-bold">Error: {error}</p>
    ) : userData ? (
      <p className="text-white font-bold capitalize">
        {userData.firstName} {userData.lastName}
      </p>
    ) : (
      <p className="text-white font-bold">Usuario no encontrado</p>
    )}
  </div>
);

const UserActions = ({
  setActiveView,
}: {
  setActiveView: (view: string) => void;
}) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActiveView("login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex justify-around 2xl:items-start 2xl:flex 2xl:justify-around 2xl:space-x-2">
      <button
        onClick={handleSignOut}
        className="text-white text-xs hover:font-semibold rounded cursor-pointer transition duration-150 ease-in-out mr-2 2xl:mr-0 2xl:px-1"
      >
        Cerrar Sesión
      </button>
      <button
        onClick={() => setActiveView("login")}
        className="text-white text-xs hover:font-semibold rounded cursor-pointer transition duration-150 ease-in-out "
      >
        Settings
      </button>
    </div>
  );
};

export default Navbar;
