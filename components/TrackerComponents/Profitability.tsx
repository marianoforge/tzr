import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import { fetchUserExpenses } from "@/lib/api/expensesApi"; // Asume que tienes este método
import { useAuthStore } from "@/stores/authStore"; // Esto sigue para obtener el userID
import Loader from "./Loader";
import { Expense, Operation } from "@/types";
import { useUserDataStore } from "@/stores/userDataStore";

const Profitability = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const validUserID = userID || ""; // Ensure userID is a string
  const currentYear = new Date().getFullYear();

  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["expenses", validUserID],
    queryFn: () => fetchUserExpenses(validUserID),
  });

  const { data: operations = [], isLoading: isLoadingOperations } = useQuery({
    queryKey: ["operations", validUserID],
    queryFn: () => fetchUserOperations(validUserID),
    enabled: !!userID,
  });

  // Filtrar operaciones para incluir solo las del año corriente
  const currentYearOperations = operations.filter((operation: Operation) => {
    const operationYear = new Date(operation.fecha_operacion).getFullYear();
    return operationYear === currentYear;
  });

  // Calcular los totales de operaciones y gastos usando las operaciones filtradas
  const totalHonorariosNetosAsesor = currentYearOperations.reduce(
    (acc: number, op: Operation) => acc + op.honorarios_asesor,
    0
  );
  const totalHonorariosBroker = currentYearOperations.reduce(
    (acc: number, op: Operation) => acc + op.honorarios_broker,
    0
  );
  const totalAmountInDollarsExpenses = expenses.reduce(
    (acc: number, exp: Expense) => acc + exp.amountInDollars, // Cambia según la estructura de tus gastos
    0
  );
  const totalExpensesTeamBroker = expenses.reduce(
    (acc: number, exp: Expense) => acc + exp.amountInDollars || 0, // Suponiendo que tengas un campo así
    0
  );

  const profitability =
    totalHonorariosNetosAsesor > 0
      ? ((totalHonorariosNetosAsesor - totalAmountInDollarsExpenses) /
          totalHonorariosNetosAsesor) *
        100
      : 0;

  const profitabilityBroker =
    totalHonorariosBroker > 0
      ? ((totalHonorariosBroker - totalExpensesTeamBroker) /
          totalHonorariosBroker) *
        100
      : 0;

  // Loader para operaciones o gastos
  const loaderFn = () => {
    if (isLoadingExpenses || isLoadingOperations) {
      return <Loader />;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="bg-white rounded-xl p-2 text-center shadow-md flex flex-col items-center h-[208px] w-full">
        <p className="text-xl font-semibold flex justify-center items-center h-2/5 pt-6">
          Rentabilidad Propia
        </p>
        <p className="text-2xl text-[48px] sm:text-2xl lg:text-[48px] xl:text-[40px] font-bold text-greenAccent h-3/5 items-center justify-center flex">
          {loaderFn() ? <Loader /> : `${profitability.toFixed(2)}%`}
        </p>
      </div>
      {/* Asume que `userData` viene desde `useAuthStore` o similar */}
      {userData?.role === "team_leader_broker" && (
        <div className="bg-white rounded-xl p-2 text-center shadow-md flex flex-col items-center justify-center h-[208px] w-full">
          <p className="text-xl font-semibold flex justify-center items-center h-2/5 pt-6">
            Rentabilidad Total
          </p>
          <p className="text-2xl text-[48px] sm:text-2xl lg:text-[48px] xl:text-[40px] font-bold text-greenAccent h-3/5 items-center justify-center flex">
            {loaderFn() ? <Loader /> : `${profitabilityBroker.toFixed(2)}%`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profitability;
