import Link from 'next/link';
import Image from 'next/image';

import Navigation from './Navigation';

const Navbar = () => {
  return (
    <header className="pt-6 sm:pt-12 lg:pt-16 w-full">
      <div className="relative flex flex-wrap items-center justify-center md:justify-between px-4 sm:px-8 md:px-16">
        <div className="w-full lg:w-[35%] flex items-center justify-center lg:justify-start mt-8 lg:mt-0">
          <Link href="/" title="Home">
            <Image
              src="/trackproLogoWhite.png"
              alt="Logo"
              width={350}
              height={350}
            />
          </Link>
        </div>
        <div className="hidden lg:flex items-center w-full md:w-[65%] justify-center">
          <Navigation />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
