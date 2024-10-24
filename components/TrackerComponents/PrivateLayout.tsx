import { useRouter } from 'next/router';

import Navbar from './NavBar/Navbar';
import VerticalNavbar from './NavBar/VerticalNavbar';
import Footer from './Footer';

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const router = useRouter();

  const setActiveView = (view: string) => {
    switch (view) {
      case 'reservationInput':
        router.push('/reservationInput');
        break;
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'eventForm':
        router.push('/eventForm');
        break;
      case 'calendar':
        router.push('/calendar');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'operationsList':
        router.push('/operationsList');
        break;
      case 'expenses':
        router.push('/expenses');
        break;
      case 'expensesList':
        router.push('/expensesList');
        break;
      case 'agents':
        router.push('/agents');
        break;
      case 'expensesBroker':
        router.push('/expensesBroker');
        break;
      case 'resetPassword':
        router.push('/reset-password');
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar setActiveView={setActiveView} />
      <VerticalNavbar setActiveView={setActiveView} />
      <main className="flex-grow mt-[38px] sm:p-6 md:p-8 xl:ml-[280px] mb-20">
        {children}
      </main>
      <Footer setActiveView={setActiveView} />
    </div>
  );
};

export default PrivateLayout;
