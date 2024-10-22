import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";
import { useExpensesStore } from "@/stores/useExpensesStore";
import Loader from "../Loader";
import { useQuery } from "@tanstack/react-query";
import { fetchUserExpenses } from "@/lib/api/expensesApi";
import useFilteredExpenses from "@/hooks/useFilteredExpenses";
import { Expense } from "@/types";
import { formatNumber } from "@/utils/formatNumber";
import { COLORS } from "@/lib/constants";

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number; payload: { amountInPesos: number } }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded-xl shadow-md">
        <p className="label font-semibold">{`Mes: ${label}`}</p>
        <p className="intro">{`Monto en Dólares: $${formatNumber(
          payload[0].value
        )}`}</p>
        <p className="intro">{`Monto en Pesos: AR$${formatNumber(
          payload[0].payload.amountInPesos
        )}`}</p>
      </div>
    );
  }

  return null;
};

const ExpensesBarchart: React.FC = () => {
  const { calculateTotals } = useExpensesStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses", userUID],
    queryFn: () => fetchUserExpenses(userUID as string),
    enabled: !!userUID,
  });

  useEffect(() => {
    if (expenses) {
      calculateTotals();
    }
  }, [expenses, calculateTotals]);

  const { teamBrokerExpenses, nonTeamBrokerExpenses } = useFilteredExpenses(
    expenses || []
  );

  const filteredExpenses = router.pathname.includes("expensesBroker")
    ? teamBrokerExpenses
    : nonTeamBrokerExpenses;

  const groupExpensesByMonth = (expenses: Expense[]) => {
    const allMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const expensesByMonth = expenses.reduce(
      (
        acc: {
          [key: string]: {
            month: string;
            amount: number;
            amountInDollars: number;
            amountInPesos: number;
          };
        },
        expense: Expense
      ) => {
        const date = new Date(expense.date);
        const year = date.getFullYear();
        if (year === 2024) {
          const month = date.toLocaleString("default", { month: "long" });
          if (!acc[month]) {
            acc[month] = {
              month,
              amount: 0,
              amountInDollars: 0,
              amountInPesos: 0,
            };
          }
          acc[month].amount += expense.amount;
          acc[month].amountInDollars += expense.amountInDollars;
          acc[month].amountInPesos += expense.amount;
        }
        return acc;
      },
      {}
    );

    // Ensure all months are present and in the correct order
    const orderedExpensesByMonth = allMonths.map((month) => {
      return (
        expensesByMonth[month] || {
          month,
          amount: 0,
          amountInDollars: 0,
          amountInPesos: 0,
        }
      );
    });

    return orderedExpensesByMonth;
  };

  const groupedExpenses = groupExpensesByMonth(filteredExpenses);

  if (isLoading) {
    return <Loader />;
  }

  console.log(filteredExpenses);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Lista de Gastos Team / Broker x Mes
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupedExpenses}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar
              dataKey="amountInDollars"
              fill={COLORS[3]}
              name="Monto en Dólares"
              barSize={50} // Adjust barSize to make columns narrower
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpensesBarchart;
