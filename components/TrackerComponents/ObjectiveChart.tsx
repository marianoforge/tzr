/* eslint-disable no-shadow */
import React, { PureComponent } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { useUserDataStore } from "@/stores/userDataStore"; // Import the store
import { OBJECTIVE_CHART_COLORS } from "@/lib/constants";
import { Operation, UserData } from "@/types";
import { calculateTotals } from "@/utils/calculations";
import { fetchUserOperations } from "@/utils/operationsApi";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { formatNumber } from "@/utils/formatNumber";

import router from "next/router";

const RADIAN = Math.PI / 180;

const needle = (
  value: number,
  data: { name: string; value: number; color: string }[],
  cx: number,
  cy: number,
  iR: number,
  oR: number,
  color: string | undefined
) => {
  let total = 0;
  data.forEach((v) => {
    total += v.value;
  });
  const ang = 180.0 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <circle key="circle" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
    <path
      key="path"
      d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
      stroke="#none"
      fill={color}
    />,
  ];
};

function withUserData(Component: React.ComponentType<ObjectiveChartProps>) {
  return function WrappedComponent(props: React.JSX.IntrinsicAttributes) {
    const { userData } = useUserDataStore();
    const { userID } = useAuthStore();
    const { data: operations = [] } = useQuery({
      queryKey: ["operations", userID],
      queryFn: () => fetchUserOperations(userID || ""),
      enabled: !!userID,
    });

    return (
      <Component {...props} userData={userData!} operations={operations} />
    );
  };
}

// Define the props type
interface ObjectiveChartProps {
  userData: UserData;
  operations: Operation[];
}

class ObjectiveChart extends PureComponent<ObjectiveChartProps> {
  render() {
    const { userData, operations } = this.props;

    const totals = calculateTotals(operations);

    const percentage =
      (totals.valor_reserva * 100) / (userData?.objetivoAnual ?? 1);

    return (
      <div
        className="bg-white rounded-lg p-2 text-center shadow-md flex flex-col items-center "
        style={{ height: "225px" }}
      >
        <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl font-semibold pt-2 pb-2">
          Objetivo Anual de Ventas
        </p>
        {!userData?.objetivoAnual ? (
          <div className="flex justify-center items-center h-[225px]">
            <button
              className="bg-mediumBlue text-white p-2 rounded-md font-semibold mt-2"
              onClick={() => {
                router.push("/settings");
              }}
            >
              Ver calendario de eventos
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <PieChart width={240} height={110}>
                <Pie
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  data={OBJECTIVE_CHART_COLORS}
                  cx={120}
                  cy={85}
                  innerRadius={55}
                  outerRadius={75}
                  fill="#8884d8"
                  stroke="none"
                  paddingAngle={1}
                >
                  {OBJECTIVE_CHART_COLORS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {needle(
                  percentage,
                  OBJECTIVE_CHART_COLORS,
                  120,
                  85,
                  55,
                  75,
                  "#7ED994"
                )}
              </PieChart>
            </div>
            <h3 className="font-semibold text-mediumBlue">
              {`Objetivo Anual de Ventas $${formatNumber(
                totals.valor_reserva
              )} / $${formatNumber(userData?.objetivoAnual ?? 0)}`}
            </h3>
          </>
        )}
      </div>
    );
  }
}

export default withUserData(ObjectiveChart);
