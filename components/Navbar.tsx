import { UserData, useUserDataStore } from "@/stores/userDataStore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";

interface NavbarProps {
  setActiveView: (view: string) => void;
}

const Navbar = ({ setActiveView }: NavbarProps) => {
  const { userData, isLoading, error, fetchUserData } = useUserDataStore();
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

  return (
    <nav className="fixed top-0 left-0 right-0 p-4 bg-[#184d6b] z-50">
      <div className="flex items-center justify-between w-full">
        {/* Hamburger menu icon */}
        <div className="lg:hidden ml-3 sm:ml-4 md:ml-10 space-x-3 flex">
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
          <div className=" text-white text-xl font-bold w-full">
            <Image
              src="/logoRea-NoBGWhite.png"
              alt="Logo"
              width={100}
              height={100}
            />
          </div>
        </div>

        {/* User info and actions */}
        <div className="hidden lg:block text-white text-xl font-bold w-full ml-12">
          <Link href="/dashboard">
            <Image
              src="/logoRea-NoBGWhite.png"
              alt="Logo"
              width={100}
              height={100}
            />
          </Link>
        </div>
        <div className="flex space-x-3 justify-end items-center mr-3 sm:mr-4 md:mr-10">
          <div className="flex flex-col items-center">
            <UserAvatar />
          </div>

          <div className="sm:flex flex-col hidden items-center">
            <UserInfo userData={userData} isLoading={isLoading} error={error} />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <>
          <div className="lg:hidden mt-6 mb-6 flex flex-col items-center">
            <NavButton
              onClick={() => handleNavClick("dashboard")}
              label="Dashboard"
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
              onClick={() => handleNavClick("calendar")}
              label="Calendario"
              fullWidth
            />
          </div>
        </>
      )}
      <div className="lg:hidden">
        <UserActions setActiveView={setActiveView} />
      </div>
    </nav>
  );
};

interface NavButtonProps {
  onClick: () => void;
  label: string;
  fullWidth?: boolean;
}

export const NavButton: React.FC<NavButtonProps> = ({
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

export const UserAvatar = () => (
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

export const UserInfo: React.FC<UserInfoProps> = ({ userData, error }) => (
  <div className="flex flex-col text-nowrap">
    {error ? (
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

export const UserActions = ({
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
    <div className="w-full flex justify-around text-nowrap">
      <button
        onClick={() => setActiveView("login")}
        className="text-white text-xs hover:font-semibold rounded cursor-pointer transition duration-150 ease-in-out "
      >
        Settings
      </button>
      <button
        onClick={handleSignOut}
        className="text-white text-xs hover:font-semibold rounded cursor-pointer transition duration-150 ease-in-out mr-2 2xl:mr-0 2xl:px-1"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Navbar;
