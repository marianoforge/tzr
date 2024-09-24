import Image from "next/image";

interface NavbarProps {
  setActiveView: (view: string) => void;
}

const Navbar = ({ setActiveView }: NavbarProps) => {
  return (
    <nav className="bg-[#4D8EB3] p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">
          Realtor Eficiency App{" "}
        </div>
        <div className="flex space-x-4 items-center">
          <button
            onClick={() => setActiveView("reservationInput")}
            className="text-white hover:bg-[#3A6D8A] px-3 py-2 rounded transition duration-150 ease-in-out"
          >
            Formulario de Operaciones
          </button>
          <button
            onClick={() => setActiveView("dashboard")}
            className="text-white hover:bg-[#3A6D8A] px-3 py-2 rounded transition duration-150 ease-in-out"
          >
            Dashboard
          </button>
          <div className="w-10 h-10 bg-white rounded-full overflow-hidden">
            <Image
              src="/avatar.jpg"
              alt="User Avatar"
              width={40} // Adjust to your desired width
              height={40} // Adjust to your desired height
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
