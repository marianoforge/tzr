import Image from 'next/image';
const PersonSection = () => {
  return (
    <section className="relative mt-[2500px] lg:mt-[2200px]  xl:mt-[596px] h-[500px] flex flex-col text-center sm:text-center md:text-start gap-8 md:flex-row pb-24 pt-16 sm:pb-32 xl:pb-0 sm:pt-24 md:pb-48 md:pt-20 items-center justify-center w-full">
      <div className="absolute -top-[400px] lg:top-0 inset-2 bottom-0 rounded-xl ring-1 ring-black/5 bg-gradient-to-r bg-black"></div>
      <div className="w-full ">
        <div className="flex relative flex-col top-16 xl:top-24 lg:flex-row justify-center items-center gap-24 mb-[120px]">
          <div className="bg-transparent/10 border ml-20 border-gray-100/15 rounded-[5%] px-[6px] py-[6px]">
            <Image
              src={'/gustavoDeSimone.jpg'}
              width={330}
              height={330}
              alt="person"
              className="rounded-[5%] shadow-xl 0"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col lg:mb-20 mb-40 lg:mt-20 leading-[3rem] w-[90%] xl:w-full ">
              <p className="text-[36px] text-white">
                "No saber como manejar tus finanzas
              </p>
              <p className="text-[36px] text-white">
                es el camino directo a la ruina"
              </p>
            </div>
            <div className="flex flex-col mb-20 mt-10">
              <p className="text-base  text-white">Gustavo de Simone</p>
              <span className="text-sm bg-gradient-to-r from-[#fff1be] ] via-[#ee87cb] bg-clip-text  to-[#b060ff] text-transparent">
                CEO de Gustavo De Simone Soluciones Inmobiliarias
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonSection;
