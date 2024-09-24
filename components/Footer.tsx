import React from "react";

interface FooterProps {
  setActiveView: (view: string) => void;
}

const Footer = ({ setActiveView }: FooterProps) => {
  return (
    <footer className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-sm">© 2023 App de Asesor</div>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView("about")}
            className="text-white hover:bg-gray-700 px-3 py-2 rounded text-sm"
          >
            Acerca de
          </button>
          <button
            onClick={() => setActiveView("contact")}
            className="text-white hover:bg-gray-700 px-3 py-2 rounded text-sm"
          >
            Contacto
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
