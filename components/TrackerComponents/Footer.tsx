import React from "react";

interface FooterProps {
  setActiveView: (view: string) => void;
}

const Footer = ({ setActiveView }: FooterProps) => {
  return (
    <footer className="bg-[#3f37c9] p-4 fixed bottom-0 w-full ">
      <div className="container mx-auto flex justify-around items-center">
        <div className="text-white text-sm">
          © 2024 Realtor Track Profit - All Rights Reserved
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView("about")}
            className="text-white hover:bg-[#3A6D8A]  py-2 rounded text-sm transition duration-150 ease-in-out"
          >
            Acerca de TrackPro
          </button>
          <button
            onClick={() => setActiveView("contact")}
            className="text-white hover:bg-[#3A6D8A]  py-2 rounded text-sm transition duration-150 ease-in-out"
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
