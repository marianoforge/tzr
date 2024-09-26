/* eslint-disable no-shadow */
import React, { PureComponent } from "react";
import { PieChart, Pie, Cell } from "recharts";

const RADIAN = Math.PI / 180;
const data = [
  { name: "A", value: 25, color: "#FFB7B2" },
  { name: "B", value: 50, color: "#F9D77E" },
  { name: "C", value: 25, color: "#7ED994" },
];

const value = 33;

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

export default class Example extends PureComponent {
  render() {
    return (
      <div className="bg-[#BAFFC9]/10 rounded-lg p-2 text-center shadow-md flex flex-col justify-between items-center h-[200px]">
        <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-base font-semibold text-gray-700 pt-8">
          Objetivo de Ventas
        </p>

        <PieChart width={120} height={100}>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx={60}
            cy={70}
            innerRadius={25}
            outerRadius={50}
            fill="#8884d8"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {needle(value, data, 60, 70, 25, 50, "#7ED994")}
        </PieChart>
      </div>
    );
  }
}
