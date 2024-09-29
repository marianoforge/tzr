/* eslint-disable no-shadow */
import { OBJECTIVE_CHART_COLORS } from "@/lib/constants";
import React, { PureComponent } from "react";
import { PieChart, Pie, Cell } from "recharts";

const RADIAN = Math.PI / 180;

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
      <div
        className="bg-white rounded-lg p-2 text-center shadow-md flex flex-col items-center h-full w-full"
        style={{ maxHeight: "225px" }}
      >
        <p className="text-sm sm:text-base lg:text-lg xl:text-lg 2xl:text-xl font-semibold text-gray-700 pt-2 pb-2">
          Objetivo Anual de Ventas
        </p>
        <div className="pb-4">
          <PieChart width={240} height={170}>
            <Pie
              dataKey="value"
              startAngle={180}
              endAngle={0}
              data={OBJECTIVE_CHART_COLORS}
              cx={120} // Ajusta la coordenada x del centro
              cy={85} // Ajusta la coordenada y del centro para que esté dentro del contenedor
              innerRadius={55} // Ajusta el radio interno
              outerRadius={75} // Ajusta el radio externo para que quepa en el contenedor
              fill="#8884d8"
              stroke="none"
              paddingAngle={1}
            >
              {OBJECTIVE_CHART_COLORS.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {needle(
              value,
              OBJECTIVE_CHART_COLORS,
              120, // Ajusta la coordenada x del centro
              85, // Ajusta la coordenada y del centro para que esté dentro del contenedor
              55, // Ajusta el radio interno
              75, // Ajusta el radio externo
              "#7ED994"
            )}
          </PieChart>
        </div>
      </div>
    );
  }
}
