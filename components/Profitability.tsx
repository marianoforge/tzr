import React, { useEffect } from "react";
import { useOperationsStore } from "@/stores/useOperationsStore";
import { useExpensesStore } from "@/stores/useExpensesStore";
import { useAuthStore } from "@/stores/authStore";
import useFilteredExpenses from "@/hooks/useFilteredExpenses";

const Profitability = () => {
  const fetchExpenses = useExpensesStore((state) => state.fetchExpenses);
  const expenses = useExpensesStore((state) => state.expenses);
  const { totals } = useFilteredExpenses(expenses);
  const { userID } = useAuthStore();
  console.log(totals.teamBrokerTotal);
  useEffect(() => {
    if (userID) {
      fetchExpenses(userID);
    }
  }, [fetchExpenses, userID]);
  const {
    totals: {
      honorarios_asesor: totalHonorariosNetosAsesor,
      honorarios_broker: totalHonorariosBroker,
    },
  } = useOperationsStore();
  const {
    totals: { totalAmountInDollars: totalAmountInDollarsExpenses },
  } = useExpensesStore();

  // Ensure both variables are numbers
  const totalHonorariosNetosNumber = Number(totalHonorariosNetosAsesor);
  const totalAmountExpensesInDollarsNumber = Number(
    totalAmountInDollarsExpenses
  );

  const totalExpensesTeamBroker = totals.teamBrokerTotal.totalAmountInDollars;

  const profitability =
    ((totalHonorariosNetosNumber - totalAmountExpensesInDollarsNumber) /
      totalHonorariosNetosNumber) *
    100;

  const profitabilityBroker =
    ((totalHonorariosBroker - totalExpensesTeamBroker) /
      totalHonorariosBroker) *
    100;

  return (
    <div className="flex gap-4">
      <div className="bg-white rounded-lg p-2 text-center shadow-md flex flex-col items-center h-[208px] w-full">
        <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl font-semibold text-gray-700 pt-2 pb-2">
          Rentabilidad Asesor
        </p>
        <p
          className={`text-2xl text-[48px] sm:text-2xl lg:text-[48px] xl:text-[40px] min-[1700px] font-bold pt-4 text-[#47d783] h-1/2 items-center justify-center flex`}
        >
          {profitability.toFixed(2)}%
        </p>
      </div>
      <div className="bg-white rounded-lg p-2 text-center shadow-md flex flex-col items-center h-[208px] w-full">
        <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl font-semibold text-gray-700 pt-2 pb-2">
          Rentabilidad Team
        </p>
        <p
          className={`text-2xl text-[48px] sm:text-2xl :text-[48px]  xl:text-[40px] min-[1700px] font-bold pt-4 text-[#47d783] h-1/2 items-center justify-center flex`}
        >
          {profitabilityBroker.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};

export default Profitability;
