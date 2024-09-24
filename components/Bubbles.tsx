import React from "react";

const Bubbles = () => {
  // Datos de ejemplo para los cuadros con colores
  const bubbleData = [
    {
      title: "Honorarios Totales Netos",
      figure: "$4.695.741,57",
      bgColor: "bg-[#F9D77E]/10",
      textColor: "text-[#C7A84E]",
    },
    {
      title: "Promedio Porcentaje Honorarios",
      figure: "9.14%",
      bgColor: "bg-[#A8E0FF]/10",
      textColor: "text-[#5EAAD7]",
    },
    {
      title: "Valores Totales de Reservas",
      figure: "$305.315.000",
      bgColor: "bg-[#FFB7B2]/10",
      textColor: "text-[#D98B84]",
    },
    {
      title: "Mayor Venta Efectuada",
      figure: "$856.000",
      bgColor: "bg-[#BAFFC9]/10",
      textColor: "text-[#7ED994]",
    },
    {
      title: "Promedio de Ventas",
      figure: "$600.000",
      bgColor: "bg-[#BAE1FF]/10",
      textColor: "text-[#7EAFD7]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4  bg-white p-4 rounded-lg">
      {bubbleData.slice(0, 3).map((data, index) => (
        <div
          key={index}
          className={`${data.bgColor} rounded-lg p-6 text-center shadow-md`}
        >
          <p className="text-xl font-semibold text-gray-700 mb-3">
            {data.title}
          </p>
          <p className={`text-2xl font-bold ${data.textColor}`}>
            {data.figure}
          </p>
        </div>
      ))}
      <div className="col-span-1 sm:col-span-3 flex justify-center gap-4">
        {bubbleData.slice(3).map((data, index) => (
          <div
            key={index + 3}
            className={`${data.bgColor} rounded-lg p-6 text-center shadow-md w-full sm:w-[calc(33.333%-0.5rem)]`}
          >
            <p className="text-xl font-semibold text-gray-700 mb-3">
              {data.title}
            </p>
            <p className={`text-2xl font-bold ${data.textColor}`}>
              {data.figure}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bubbles;
