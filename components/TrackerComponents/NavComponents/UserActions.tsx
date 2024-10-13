import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  ArrowLeftStartOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface UserActionsProps {
  setActiveView: (view: string) => void;
}

export const UserActions = ({ setActiveView }: UserActionsProps) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);

      localStorage.clear();
      setActiveView("login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="w-full flex justify-around mt-4">
      <Link
        href={"/settings"}
        className="text-white xl:text-mediumBlue font-semibold rounded cursor-pointer transition duration-150 ease-in-out flex justify-center items-center gap-1 w-1/2"
      >
        <Cog6ToothIcon className="h-5 w-5" />
        Perfil
      </Link>
      <Link
        href="/"
        onClick={handleSignOut}
        className="text-white xl:text-redAccent font-semibold rounded cursor-pointer transition duration-150 ease-in-out flex xl:pr-4 justify-center items-center gap-1 w-1/2"
      >
        <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
        <p>Sign Out</p>
      </Link>
    </div>
  );
};
