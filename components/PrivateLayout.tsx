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
    }
  };

  return (
    <div>
      <Navbar setActiveView={setActiveView} />
      <main className="p-6">{children}</main>
      <Footer setActiveView={setActiveView} />
    </div>
  );
};

export default PrivateLayout;
