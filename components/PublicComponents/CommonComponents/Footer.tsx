import Link from 'next/link';
import React from 'react';

interface FooterProps {
  setActiveView: (view: string) => void;
}

const Footer = ({ setActiveView }: FooterProps) => {
  return (
    <footer className="p-4 relative h-[600px] w-full rounded-xl">
      <div className="absolute inset-2 bottom-0 rounded-xl ring-1 ring-black/5 bg-gradient-to-r from-mediumBlue via-lightBlue to-darkBlue -z-10"></div>
      <div className="flex flex-col mx-auto  justify-around text-white items-center mt-10 z-50">
        <div className="text-white text-[40px] text-center mt-10 leading-tight">
          <p>¿Estás listo para emprender</p>
          <p>como los profesionales?</p>
        </div>
        <div className="text-white text-md text-center mt-6">
          <p>Get the cheat codes for selling and unlock your</p>
          <p>team's revenue potential.</p>
        </div>
        <Link href="/register">
          <button className="w-[182px] px-4 lg:mt-10 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white">
            Empieza Gratis
          </button>
        </Link>

        <hr className="w-full border-t border-dotted border-opacity-50  border-white mt-10" />
        <hr className="w-full border-t border-dotted border-opacity-50  border-white my-1" />
        <hr className="w-full border-t border-dotted border-opacity-50  border-white mt-24" />
        <hr className="w-full border-t border-dotted border-opacity-50  border-white my-1" />
        <hr className="w-full border-t border-dotted border-opacity-50  border-white mt-10" />
        <hr className="w-full border-t border-dotted border-opacity-50  border-white my-1" />
      </div>
    </footer>
  );
};

export default Footer;
