// components/PrivateLayout.tsx
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import VerticalNavbar from "./VerticalNavbar";
import Footer from "./Footer";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const router = useRouter();

  const setActiveView = (view: string) => {
    switch (view) {
      case "reservationInput":
        router.push("/reservationInput");
        break;
      case "dashboard":
        router.push("/dashboard");
        break;
      case "eventForm":
        router.push("/eventForm");
        break;
      case "calendar":
        router.push("/calendar");
        break;
      case "settings":
        router.push("/settings");
        break;
      case "operationsList":
        router.push("/operationsList");
        break;
      case "expenses":
        router.push("/expenses");
        break;
      case "expensesList":
        router.push("/expensesList");
        break;
      case "agents":
        router.push("/agents");
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar setActiveView={setActiveView} />
      <VerticalNavbar setActiveView={setActiveView} />
      <main className="flex-grow mt-[70px] pt-4 sm:p-6 md:p-8 lg:ml-64">
        {children}
      </main>
      <Footer setActiveView={setActiveView} />
    </div>
  );
};

export default PrivateLayout;
