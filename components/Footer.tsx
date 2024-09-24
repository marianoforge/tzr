import React from "react";

interface FooterProps {
  setActiveView: (view: string) => void;
}

const Footer = ({ setActiveView }: FooterProps) => {
  return (
    <footer className="bg-[#4D8EB3] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-sm">© 2023 App de Asesor</div>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView("about")}
            className="text-white hover:bg-[#3A6D8A] px-3 py-2 rounded text-sm transition duration-150 ease-in-out"
          >
            Acerca de
          </button>
          <button
            onClick={() => setActiveView("contact")}
            className="text-white hover:bg-[#3A6D8A] px-3 py-2 rounded text-sm transition duration-150 ease-in-out"
          >
            Contacto
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
