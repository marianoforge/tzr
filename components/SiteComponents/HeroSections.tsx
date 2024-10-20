import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="text-white relative flex flex-col text-center sm:text-center md:text-start gap-8 md:flex-row w-full pb-24 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-32 items-center justify-center">
      <div className="flex flex-col justify-center w-full md:w-[65%] px-4 sm:px-8 md:px-16  text-white">
        <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-8">
          Se eficiente, se productivo, se parte del 1%
        </h3>
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[72px] font-medium leading-tight mt-2">
          Optimiza tus números, multiplica tus resultados
        </h1>
      </div>
      <div className="flex justify-start w-full md:w-[35%] text-wrap text-white pr-4 sm:pr-6 flex-col">
        <p className="leading-6 sm:leading-7 text-base sm:text-lg">
          El 97% de los asesores inmobiliarios en Latinoamerica no son capaces
          de vivir dignamente con lo que ganan; el 2% solo gana lo suficiente
          para vivir. Pero el 1% restante se hace millonario.
        </p>
        <Link href="/register">
          <button className="px-4 mt-10 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white">
            Empieza Gratis
          </button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
