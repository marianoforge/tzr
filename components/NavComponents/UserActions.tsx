import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
        onClick={() => setActiveView("settings")}
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
