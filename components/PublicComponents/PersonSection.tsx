import BounceCard from './BounceCard';

const PersonSection = () => {
  return (
    <section className="relative mt-[560px] h-[400px] flex flex-col text-center sm:text-center md:text-start gap-8 md:flex-row pb-24 pt-16 sm:pb-32 xl:pb-0 sm:pt-24 md:pb-48 md:pt-20 items-center justify-center w-full">
      <div className="absolute  inset-2 bottom-0 rounded-xl ring-1 ring-black/5 bg-gradient-to-r bg-black"></div>
      <div className="w-full">
        <div className="flex flex-col lg:flex-row justify-around items-center mb-[120px]"></div>
      </div>
    </section>
  );
};

export default PersonSection;
