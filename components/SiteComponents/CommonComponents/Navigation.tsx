import Link from "next/link";
import { useAuthStore } from "@/stores/authStore"; // Importa el hook

const Navigation = () => {
  const { userID } = useAuthStore(); // Obtiene el estado del usuario
  return (
    <div className="w-full flex flex-col sm:flex-row justify-between">
      <nav className="hidden w-full sm:w-[50%] space-x-2 sm:space-x-4 items-center justify-center lg:hidden 2xl:flex">
        {[
          { name: "Pricing", link: "/" },
          { name: "Company", link: "/" },
          { name: "Solution", link: "/" },
          { name: "Contact", link: "/" },
        ].map((item, index) => (
          <Link href={item.link} key={index}>
            <button className="px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-xl font-bold text-lightPink">
              {item.name}
            </button>
          </Link>
        ))}
      </nav>
      <nav className="hidden w-full sm:w-[50%] lg:w-full md:flex space-x-2 sm:space-x-4 items-center justify-end">
        {userID ? ( // Condición para mostrar el botón solo si el usuario está logueado
          <Link href="/dashboard">
            <button className="px-2 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-lightPink text-mediumBlue hover:bg-mediumBlue hover:text-white">
              Dashboard
            </button>
          </Link>
        ) : (
          [
            { name: "Register", link: "/register" },
            { name: "Login", link: "/login" },
          ].map((item, index) => (
            <Link href={item.link} key={index}>
              <button className="px-2 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-lightPink text-mediumBlue hover:bg-mediumBlue hover:text-white">
                {item.name}
              </button>
            </Link>
          ))
        )}
      </nav>
    </div>
  );
};

export default Navigation;
