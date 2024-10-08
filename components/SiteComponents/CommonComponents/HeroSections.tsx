import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="flex w-full pb-24 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-32 items-center justify-center">
      <div className="flex flex-col justify-center w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-48">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-medium text-lightPink">
          Efficiency for every deal
        </h1>
        <p className="mt-4 sm:mt-8 max-w-xl text-lg sm:text-xl md:text-2xl lg:text-3xl leading-8 sm:leading-10 text-lightPink">
          TrackPro helps realtors to thrive in their business.
        </p>
        <div className="mt-8 sm:mt-12 flex flex-col gap-4 sm:gap-6 sm:flex-row">
          <Link href="/register">
            <button className="cursor-pointer shadow-md shadow-mediumBlue inline-flex items-center px-6 py-3 rounded-full bg-mediumBlue ring-1 ring-lightPink text-white text-lg font-medium hover:bg-lightPink hover:text-mediumBlue hover:ring-mediumBlue">
              Get started
            </button>
          </Link>
          <Link href="/pricing">
            <button className="cursor-pointer shadow-md shadow-mediumBlue inline-flex items-center px-6 py-3 rounded-full bg-lightPink ring-1 ring-mediumBlue text-mediumBlue text-lg hover:bg-mediumBlue hover:text-white hover:ring-lightPink">
              See pricing
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
