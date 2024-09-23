// components/Navbar.tsx

interface NavbarProps {
  setActiveView: (view: string) => void;
}

const Navbar = ({ setActiveView }: NavbarProps) => {
  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">App de Asesor</div>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView("reservationInput")}
            className="text-white hover:bg-blue-600 px-3 py-2 rounded"
          >
            Formulario de Operaciones
          </button>
          <button
            onClick={() => setActiveView("dashboard")}
            className="text-white hover:bg-blue-600 px-3 py-2 rounded"
          >
            Dashboard
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
