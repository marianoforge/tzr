import Link from "next/link";
import Image from "next/image";
import Navigation from "./Navigation";
const Navbar = () => {
  return (
    <header className="pt-6 sm:pt-12 lg:pt-16 w-full">
      <div className="relative flex flex-wrap items-center justify-between px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-48">
        <div className="flex items-center">
          <Link href="/" title="Home">
            <Image
              src="/trackProLogoNoBg.png"
              alt="Logo"
              width={150}
              height={150}
              className="w-24 sm:w-32 md:w-40 lg:w-48"
            />
          </Link>
        </div>
        <div className="hidden lg:flex items-center">
          <Navigation />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
