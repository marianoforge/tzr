import React from "react";

const Profitability = () => {
  return (
    <div className="bg-white rounded-lg p-2 text-center shadow-md flex flex-col items-center h-[208px] w-full">
      <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl font-semibold text-gray-700 pt-2 pb-2">
        Rentabilidad
      </p>
      <p
        className={`text-2xl sm:text-xl lg:text-[22px] xl:text-[48px] min-[1700px] font-bold text-[#C25B33] h-1/2 items-center justify-center flex`}
      >
        17%
      </p>{" "}
    </div>
  );
};

export default Profitability;
