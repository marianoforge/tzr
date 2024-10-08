import Link from "next/link";

const Navigation = () => {
  return (
    <nav className="hidden lg:flex space-x-2 sm:space-x-4 items-center font-semibold">
      {[
        { name: "Pricing", link: "/pricing" },
        { name: "Company", link: "/company" },
        { name: "Register", link: "/register" },
        { name: "Login", link: "/login" },
      ].map((item, index) => (
        <Link href={item.link} key={index}>
          <button className="px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-bold text-lightPink">
            {item.name}
          </button>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
