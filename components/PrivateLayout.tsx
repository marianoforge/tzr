// components/PrivateLayout.tsx
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const router = useRouter();

  const setActiveView = (view: string) => {
    if (view === "reservationInput") {
      router.push("/reservationInput");
    } else if (view === "dashboard") {
      router.push("/dashboard");
    } else if (view === "eventForm") {
      router.push("/eventForm");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar setActiveView={setActiveView} />
      <main className="flex-grow p-6">{children}</main>
      <Footer setActiveView={setActiveView} />
    </div>
  );
};

export default PrivateLayout;
