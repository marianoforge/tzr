// components/PrivateLayout.tsx
import { useRouter } from "next/router";
import Navbar from "./NavBar/Navbar";
import VerticalNavbar from "./NavBar/VerticalNavbar";
import Footer from "./Footer";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const router = useRouter();

  const setActiveView = (view: string) => {
    switch (view) {
      case "reservationInput":
        router.push("/tracker/reservationInput");
        break;
      case "dashboard":
        router.push("/tracker/dashboard");
        break;
      case "eventForm":
        router.push("/tracker/eventForm");
        break;
      case "calendar":
        router.push("/tracker/calendar");
        break;
      case "settings":
        router.push("/tracker/settings");
        break;
      case "operationsList":
        router.push("/tracker/operationsList");
        break;
      case "expenses":
        router.push("/tracker/expenses");
        break;
      case "expensesList":
        router.push("/tracker/expensesList");
        break;
      case "agents":
        router.push("/tracker/agents");
        break;
      case "expensesBroker":
        router.push("/tracker/expensesBroker");
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar setActiveView={setActiveView} />
      <VerticalNavbar setActiveView={setActiveView} />
      <main className="flex-grow mt-[32px] sm:p-6 md:p-8 xl:ml-[280px]">
        {children}
      </main>
      <Footer setActiveView={setActiveView} />
    </div>
  );
};

export default PrivateLayout;
