import React, { useEffect } from "react";
import { useOperationsStore } from "@/stores/useOperationsStore";
import { useExpensesStore } from "@/stores/useExpensesStore";
import { useAuthStore } from "@/stores/authStore";
import useFilteredExpenses from "@/hooks/useFilteredExpenses";
import Loader from "./Loader";

const Profitability = () => {
  const fetchExpenses = useExpensesStore((state) => state.fetchExpenses);
  const expenses = useExpensesStore((state) => state.expenses);
  const { totals } = useFilteredExpenses(expenses);
  const { userID } = useAuthStore();
  const isLoadingExpenses = useExpensesStore((state) => state.isLoading);

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
    isLoading: isLoadingOperations,
  } = useOperationsStore();

  const {
    totals: { totalAmountInDollars: totalAmountInDollarsExpenses },
  } = useExpensesStore();

  const loaderFn = () => {
    if (isLoadingExpenses || isLoadingOperations) {
      return <Loader />;
    }
  };

  // Ensure both variables are numbers
  const totalHonorariosNetosNumber = Number(totalHonorariosNetosAsesor);
  const totalAmountExpensesInDollarsNumber = Number(
    totalAmountInDollarsExpenses
  );

  const totalExpensesTeamBroker = totals.teamBrokerTotal.totalAmountInDollars;

  const profitability =
    totalHonorariosNetosNumber > 0
      ? ((totalHonorariosNetosNumber - totalAmountExpensesInDollarsNumber) /
          totalHonorariosNetosNumber) *
        100
      : 0;

  const profitabilityBroker =
    totalHonorariosBroker > 0
      ? ((totalHonorariosBroker - totalExpensesTeamBroker) /
          totalHonorariosBroker) *
        100
      : 0;

  return (
    <div className="flex gap-4">
      <div className="bg-white rounded-xl p-2 text-center shadow-md flex flex-col items-center h-[208px] w-full">
        <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl font-semibold flex justify-center items-centerh-2/5 pt-6">
          Rentabilidad Asesor
        </p>
        <p
          className={`text-2xl text-[48px] sm:text-2xl lg:text-[48px] xl:text-[40px] min-[1700px] font-bold text-[#47d783] h-3/5 items-center justify-center flex`}
        >
          {loaderFn() ? <Loader /> : `${profitability.toFixed(2)}%`}
        </p>
      </div>
      <div className="bg-white rounded-xl p-2 text-center shadow-md flex flex-col items-center justify-center h-[208px] w-full">
        <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl font-semibold flex justify-center items-center h-2/5 pt-6">
          Rentabilidad Team
        </p>
        <p
          className={`text-2xl text-[48px] sm:text-2xl :text-[48px]  xl:text-[40px] min-[1700px] font-bold text-[#47d783] h-3/5 items-center justify-center flex`}
        >
          {loaderFn() ? <Loader /> : `${profitabilityBroker.toFixed(2)}%`}
        </p>
      </div>
    </div>
  );
};

export default Profitability;
