import Link from "next/link";

const Navigation = () => {
  return (
    <div className="w-full flex flex-col sm:flex-row justify-between">
      <nav className="hidden w-full sm:w-[50%] space-x-2 sm:space-x-4 items-center justify-center lg:hidden 2xl:flex">
        {[
          { name: "Pricing", link: "/pricing" },
          { name: "Company", link: "/company" },
          { name: "Solution", link: "/login" },
          { name: "Contact", link: "/login" },
        ].map((item, index) => (
          <Link href={item.link} key={index}>
            <button className="px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-xl font-bold text-lightPink">
              {item.name}
            </button>
          </Link>
        ))}
      </nav>
      <nav className="hidden w-full sm:w-[50%] lg:w-full md:flex space-x-2 sm:space-x-4 items-center justify-end">
        {[
          { name: "Register", link: "/register" },
          { name: "Login", link: "/login" },
        ].map((item, index) => (
          <Link href={item.link} key={index}>
            <button className="px-2 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-lightPink text-mediumBlue hover:bg-mediumBlue hover:text-white">
              {item.name}
            </button>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Navigation;
