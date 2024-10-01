import React, { useEffect } from "react";
import { useOperationsStore } from "@/stores/useOperationsStore";
import { useExpensesStore } from "@/stores/useExpensesStore";
import { formatNumber } from "@/utils/formatNumber";
import { useAuthStore } from "@/stores/authStore";

const Profitability = () => {
  const fetchExpenses = useExpensesStore((state) => state.fetchExpenses);
  const { userID } = useAuthStore();

  useEffect(() => {
    if (userID) {
      fetchExpenses(userID);
    }
  }, [fetchExpenses, userID]);
  const {
    totals: { honorarios_asesor: totalHonorariosNetos },
  } = useOperationsStore();
  const {
    totals: { totalAmountInDollars },
  } = useExpensesStore();

  // Ensure both variables are numbers
  const totalHonorariosNetosNumber = Number(totalHonorariosNetos);
  const totalAmountInDollarsNumber = Number(totalAmountInDollars);

  const profitability = totalHonorariosNetosNumber - totalAmountInDollarsNumber;

  return (
    <div className="bg-white rounded-lg p-2 text-center shadow-md flex flex-col items-center h-[208px] w-full">
      <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl font-semibold text-gray-700 pt-2 pb-2">
        Rentabilidad
      </p>
      <p
        className={`text-2xl text-[48px] sm:text-2xl :text-[48px]  xl:text-[48px] min-[1700px] font-bold pt-4 text-[#47d783] h-1/2 items-center justify-center flex`}
      >
        ${formatNumber(profitability)}
      </p>
    </div>
  );
};

export default Profitability;
