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
      <div className="bg-white rounded-lg p-2 text-center shadow-md flex flex-col items-center h-full w-full">
        <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-2xl font-semibold text-gray-700 pt-8 pb-20">
          Objetivo Anual de Ventas
        </p>
        <div className="pb-4">
          <PieChart width={320} height={200}>
            <Pie
              dataKey="value"
              startAngle={180}
              endAngle={0}
              data={data}
              cx={150} // Centra la coordenada x del centro
              cy={150} // Centra la coordenada y del centro
              innerRadius={75} // Ajusta el radio interno
              outerRadius={150} // Ajusta el radio externo
              fill="#8884d8"
              stroke="none"
              paddingAngle={1}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {needle(value, data, 150, 150, 75, 150, "#7ED994")}
          </PieChart>
        </div>
      </div>
    );
  }
}
