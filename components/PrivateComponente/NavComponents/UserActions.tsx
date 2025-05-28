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
      router.push('/login');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Botón de Configuración */}
      <Link
        href={'/settings'}
        className="flex items-center space-x-3 w-full px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      >
        <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Configuración</span>
      </Link>

      {/* Botón de Cerrar Sesión */}
      <button
        onClick={handleSignOut}
        className="flex items-center space-x-3 w-full px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left"
      >
        <ArrowLeftStartOnRectangleIcon className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Cerrar Sesión</span>
      </button>
    </div>
  );
};
