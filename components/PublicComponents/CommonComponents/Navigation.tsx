import Link from 'next/link';
import { useState } from 'react';

import { useAuthStore } from '@/stores/authStore'; // Importa el hook

import LicensesModal from '../LicensesModal'; // Asegúrate de que la ruta sea correcta

const Navigation = () => {
  const { userID } = useAuthStore(); // Obtiene el estado del usuario
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal

  const openModal = () => {
    setIsModalOpen(true); // Función para abrir el modal
  };

  return (
    <div className="w-full flex flex-col sm:flex-row justify-between">
      {/* <nav className="hidden w-full sm:w-[50%] space-x-2 sm:space-x-4 items-center justify-center lg:hidden 2xl:flex">
        {[
          { name: 'Pricing', link: '/' },
          { name: 'Company', link: '/' },
          { name: 'Solution', link: '/' },
          { name: 'Contact', link: '/' },
        ].map((item, index) => (
          <Link href={item.link} key={index}>
            <button className="px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-xl font-bold text-white">
              {item.name}
            </button>
          </Link>
        ))}
      </nav> */}
      <nav className="hidden w-full sm:w-[50%] lg:w-full md:flex space-x-2 sm:space-x-4 items-center justify-end">
        {userID ? (
          <Link href="/dashboard">
            <button className="px-2 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white">
              Dashboard
            </button>
          </Link>
        ) : (
          [
            { name: 'Register', link: '#', onClick: openModal }, // Añadir onClick
            { name: 'Login', link: '/login' },
          ].map((item, index) => (
            <Link href={item.link} key={index}>
              <button
                className="px-2 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white"
                onClick={item.onClick}
              >
                {item.name}
              </button>
            </Link>
          ))
        )}
      </nav>
      {isModalOpen && (
        <LicensesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Navigation;
