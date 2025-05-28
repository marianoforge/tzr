import { useState, Fragment } from 'react';
import Image from 'next/image';
import {
  VideoCameraIcon,
  XMarkIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';

import { useUserDataStore } from '@/stores/userDataStore';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/common/enums';

// Tipos para el menú
interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

interface MenuSections {
  [key: string]: MenuSection;
}

const Navbar = () => {
  const { userData } = useUserDataStore();
  const { role: authRole } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Definir las secciones del menú con iconos y categorías
  const menuSections: MenuSections = {
    dashboard: {
      title: 'Dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard Principal',
          icon: <HomeIcon className="h-4 w-4" />,
        },
      ],
    },
    operations: {
      title: 'Operaciones',
      icon: <DocumentTextIcon className="h-5 w-5" />,
      items: [
        {
          href: '/operationsList',
          label: 'Lista de Operaciones',
          icon: <DocumentTextIcon className="h-4 w-4" />,
        },
        {
          href: '/reservationInput',
          label: 'Nueva Operación',
          icon: <PlusIcon className="h-4 w-4" />,
        },
        {
          href: '/projections',
          label: 'Proyecciones',
          icon: <ChartBarIcon className="h-4 w-4" />,
        },
      ],
    },
    expenses: {
      title: 'Gastos',
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
      items: [
        {
          href: '/expensesList',
          label: 'Lista de Gastos',
          icon: <CurrencyDollarIcon className="h-4 w-4" />,
        },
        {
          href: '/expenses',
          label: 'Nuevo Gasto',
          icon: <PlusIcon className="h-4 w-4" />,
        },
        {
          href: '/expenses-agents-form',
          label: 'Gastos de Asesores',
          icon: <UsersIcon className="h-4 w-4" />,
        },
      ],
    },
    events: {
      title: 'Eventos',
      icon: <CalendarIcon className="h-5 w-5" />,
      items: [
        {
          href: '/calendar',
          label: 'Calendario',
          icon: <CalendarIcon className="h-4 w-4" />,
        },
        {
          href: '/eventForm',
          label: 'Nuevo Evento',
          icon: <PlusIcon className="h-4 w-4" />,
        },
      ],
    },
  };

  const adminSections: MenuSections = {
    ...menuSections,
    admin: {
      title: 'Administración',
      icon: <UsersIcon className="h-5 w-5" />,
      items: [
        {
          href: '/team-admin',
          label: 'Seguimiento del Equipo',
          icon: <UsersIcon className="h-4 w-4" />,
        },
        {
          href: '/agents',
          label: 'Tabla de Asesores',
          icon: <UserCircleIcon className="h-4 w-4" />,
        },
        {
          href: '/expenses-agents',
          label: 'Gastos por Asesor',
          icon: <CurrencyDollarIcon className="h-4 w-4" />,
        },
      ],
    },
  };

  const supportItems: MenuItem[] = [
    {
      href: '/faqs',
      label: 'Preguntas Frecuentes',
      icon: <QuestionMarkCircleIcon className="h-4 w-4" />,
    },
  ];

  const getSections = (): MenuSections => {
    const roleToUse = userData?.role || authRole;

    switch (roleToUse) {
      case UserRole.TEAM_LEADER_BROKER:
        return adminSections;
      case UserRole.AGENTE_ASESOR:
        return menuSections;
      default:
        return { dashboard: menuSections.dashboard };
    }
  };

  const filteredSections = (): MenuSections => {
    if (!searchQuery) return getSections();

    const filtered: MenuSections = {};
    Object.entries(getSections()).forEach(([key, section]) => {
      const filteredItems = section.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filteredItems.length > 0) {
        filtered[key] = { ...section, items: filteredItems };
      }
    });
    return filtered;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full bg-darkBlue z-50 text-center">
        <div className="flex items-center justify-between w-full px-4 py-6">
          <div className="hidden xl:flex items-center justify-center w-full -mt-2 ml-[300px]">
            <a
              href="https://www.youtube.com/playlist?list=PLDkJwMV1ib37YHUQTgG-0e1b7uNV6lk0C"
              target="_blank"
              className="bg-gradient-to-r from-[#FFB7B2] via-lightBlue bg-clip-text to-[#ffffff] text-transparent font-semibold hover:underline mr-4"
            >
              NO TE OLVIDES DE VER LOS TUTORIALES{' '}
            </a>
            <VideoCameraIcon className="h-5 w-5 text-white" />
          </div>

          {/* Hamburger menu icon - Mejorado */}
          <div className="xl:hidden flex items-center">
            <button
              className="text-white focus:outline-none p-3 hover:bg-white/10 rounded-lg transition-colors duration-200"
              onClick={toggleMenu}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>

          {/* Logo con más espacio */}
          <div className="flex-1 flex justify-center xl:hidden">
            <div className="flex items-center justify-center py-2">
              <Image
                src="/trackproLogoWhite.png"
                alt="Logo"
                width={280}
                height={280}
                priority
              />
            </div>
          </div>

          {/* Espacio para balancear el layout */}
          <div className="xl:hidden w-[60px]"></div>
        </div>
      </nav>

      {/* Nuevo Menú Móvil Moderno - Solo para móviles */}
      <Transition show={isMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={closeMenu}
        >
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>

          {/* Panel del Menú */}
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-sm flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 pt-20">
                  {/* Header del menú con perfil */}
                  <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-lightBlue to-mediumBlue flex items-center justify-center">
                        <UserCircleIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {userData?.firstName || userData?.email || 'Usuario'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {userData?.role === UserRole.TEAM_LEADER_BROKER
                          ? 'Team Leader'
                          : 'Agente Asesor'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="ml-auto flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                      onClick={closeMenu}
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                  </div>

                  {/* Barra de búsqueda */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-mediumBlue focus:border-transparent transition-all duration-200"
                      placeholder="Buscar funciones..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Navegación por secciones */}
                  <nav className="flex-1 space-y-2">
                    {Object.entries(filteredSections()).map(
                      ([key, section]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
                            <span className="text-mediumBlue">
                              {section.icon}
                            </span>
                            <span>{section.title}</span>
                          </div>

                          <div className="ml-4 space-y-1">
                            {section.items.map((item) => (
                              <a
                                key={item.href}
                                href={item.href}
                                onClick={closeMenu}
                                className="group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-lightBlue/10 hover:text-mediumBlue transition-all duration-200"
                              >
                                <span className="text-gray-400 group-hover:text-mediumBlue transition-colors duration-200">
                                  {item.icon}
                                </span>
                                <span>{item.label}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )
                    )}

                    {/* Sección de Soporte */}
                    <div className="space-y-1 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
                        <QuestionMarkCircleIcon className="h-5 w-5 text-mediumBlue" />
                        <span>Soporte</span>
                      </div>

                      <div className="ml-4 space-y-1">
                        {supportItems.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className="group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-lightBlue/10 hover:text-mediumBlue transition-all duration-200"
                          >
                            <span className="text-gray-400 group-hover:text-mediumBlue transition-colors duration-200">
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </a>
                        ))}

                        {/* Link a tutoriales */}
                        <a
                          href="https://www.youtube.com/playlist?list=PLDkJwMV1ib37YHUQTgG-0e1b7uNV6lk0C"
                          target="_blank"
                          onClick={closeMenu}
                          className="group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-lightBlue/10 hover:text-mediumBlue transition-all duration-200"
                        >
                          <span className="text-gray-400 group-hover:text-mediumBlue transition-colors duration-200">
                            <VideoCameraIcon className="h-4 w-4" />
                          </span>
                          <span>Tutoriales</span>
                        </a>
                      </div>
                    </div>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Navbar;
