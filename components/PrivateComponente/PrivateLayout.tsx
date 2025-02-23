import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

import { PATHS } from '@/common/enums';
import { db, auth } from '@/lib/firebase';

import Navbar from './NavBar/Navbar';
import VerticalNavbar from './NavBar/VerticalNavbar';
import Footer from './Footer';
interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push('/');
          return;
        }

        const userDocRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data()?.stripeSubscriptionId) {
          setIsVerified(true);
        } else {
          router.push('/');
        }
      });
    };

    checkSubscription();
  }, [router]);

  if (isVerified === null) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  const setActiveView = (view: string) => {
    switch (view) {
      case PATHS.RESERVATION_INPUT:
        router.push(PATHS.RESERVATION_INPUT);
        break;
      case PATHS.DASHBOARD:
        router.push(PATHS.DASHBOARD);
        break;
      case PATHS.EVENT_FORM:
        router.push(PATHS.EVENT_FORM);
        break;
      case PATHS.CALENDAR:
        router.push('/calendar');
        break;
      case PATHS.SETTINGS:
        router.push(PATHS.SETTINGS);
        break;
      case PATHS.OPERATIONS_LIST:
        router.push(PATHS.OPERATIONS_LIST);
        break;
      case PATHS.EXPENSES:
        router.push(PATHS.EXPENSES);
        break;
      case PATHS.EXPENSES_LIST:
        router.push(PATHS.EXPENSES_LIST);
        break;
      case PATHS.AGENTS:
        router.push(PATHS.AGENTS);
        break;
      case PATHS.EXPENSES_BROKER:
        router.push(PATHS.EXPENSES_BROKER);
        break;
      case PATHS.RESET_PASSWORD:
        router.push(PATHS.RESET_PASSWORD);
        break;
      case PATHS.PROJECTIONS:
        router.push(PATHS.PROJECTIONS);
        break;
      case PATHS.EXPENSES_AGENTS_LIST:
        router.push(PATHS.EXPENSES_AGENTS_LIST);
        break;
      case PATHS.EXPENSES_AGENTS_FORM:
        router.push(PATHS.EXPENSES_AGENTS_FORM);
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <VerticalNavbar />
      <main className="flex-grow mt-[38px] sm:p-6 md:p-8 xl:ml-[280px] mb-20">
        {children}
      </main>
      <Footer setActiveView={setActiveView} />
    </div>
  );
};

export default PrivateLayout;
