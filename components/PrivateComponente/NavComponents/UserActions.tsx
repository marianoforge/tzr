import { signOut } from 'firebase/auth';
import {
  ArrowLeftStartOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { auth } from '@/lib/firebase';

export const UserActions = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);

      router.push('/'); // Redirigir a la página de inicio después del sign out
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="w-full flex justify-around my-4">
      <Link
        href={'/settings'}
        className="text-white xl:text-mediumBlue font-semibold rounded cursor-pointer transition duration-150 ease-in-out flex justify-center items-center gap-1 w-1/2"
      >
        <Cog6ToothIcon className="h-5 w-5" />
        Perfil Personal
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
