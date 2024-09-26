// components/OperationsList.tsx
import { OperationsListProps } from "@/types";
import { formatNumber } from "@/utils/formatNumber";
import { useEffect } from "react";
import { useOperationsStore } from "@/stores/operationsStore";
import Loader from "./Loader";

const OperationsList = ({ userId }: OperationsListProps) => {
  const { operations, totals, setOperations, calculateTotals, isLoading } =
    useOperationsStore();

  const handleEstadoChange = async (id: string, currentEstado: string) => {
    const newEstado = currentEstado === "En Curso" ? "Cerrada" : "En Curso";
    try {
      const response = await fetch(`/api/updateOperationStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, estado: newEstado }),
      });

      if (!response.ok) {
        throw new Error("Error updating operation status");
      }

      setOperations(
        operations.map((operacion) =>
          operacion.id === id ? { ...operacion, estado: newEstado } : operacion
        )
      );
      calculateTotals();
    } catch (error) {
      console.error("Error updating operation status:", error);
    }
  };

  useEffect(() => {
    const fetchOperaciones = async () => {
      if (!userId) return;

      try {
        const response = await fetch(
          `/api/operationsPerUser?user_uid=${userId}`
        );
        if (!response.ok) {
          throw new Error("Error fetching operations");
        }

        const data = await response.json();
        setOperations(data);
        calculateTotals();
      } catch (error) {
        console.error("Error fetching operations:", error);
      }
    };

    fetchOperaciones();
  }, [userId, setOperations, calculateTotals]);

  const COLORS = {
    headerBg: "bg-[#5DADE2]/10",
    headerText: "text-[#2E86C1]",
    rowBg: "bg-white",
    rowHover: "hover:bg-[#5DADE2]/10",
    buttonBgEnCurso: "bg-[#7ED994]",
    buttonHoverEnCurso: "hover:bg-[#34D399]",
    buttonBgCerrada: "bg-[#F9D789]",
    buttonHoverCerrada: "hover:bg-[#374151]",
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Lista de Operaciones
      </h2>
      {operations.length === 0 ? (
        <p className="text-center text-gray-600">No existen operaciones</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`${COLORS.headerBg} hidden md:table-row`}>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Fecha de Operación
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Dirección de Reserva
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Tipo de Operación
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Referido
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Compartido
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Sobre de Reserva
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Sobre de Refuerzo
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Valor Reserva
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Porcentaje Honorarios Asesor
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Porcentaje Honorarios Agencia
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Honorarios Netos
                </th>
                <th className={`py-3 px-4 ${COLORS.headerText} font-semibold`}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {operations.map((operacion) => (
                <tr
                  key={operacion.id}
                  className={`${COLORS.rowBg} ${COLORS.rowHover} border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out`}
                >
                  <td className="py-3 px-4 before:content-['Fecha:'] md:before:content-none">
                    {new Date(operacion.fecha_operacion).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 before:content-['Dirección:'] md:before:content-none">
                    {operacion.direccion_reserva}
                  </td>
                  <td className="py-3 px-4 before:content-['Tipo:'] md:before:content-none">
                    {operacion.tipo_operacion}
                  </td>
                  <td className="py-3 px-4 before:content-['Referido:'] md:before:content-none">
                    {operacion.referido}
                  </td>
                  <td className="py-3 px-4 before:content-['Compartido:'] md:before:content-none">
                    {operacion.compartido}
                  </td>
                  <td className="py-3 px-4 before:content-['Sobre Reserva:'] md:before:content-none">
                    {operacion.numero_sobre_reserva}
                  </td>
                  <td className="py-3 px-4 before:content-['Sobre Refuerzo:'] md:before:content-none">
                    {operacion.numero_sobre_refuerzo}
                  </td>
                  <td className="py-3 px-4 before:content-['Valor Reserva:'] md:before:content-none">
                    ${formatNumber(operacion.valor_reserva)}
                  </td>
                  <td className="py-3 px-4 before:content-['% Honorarios Asesor:'] md:before:content-none">
                    {formatNumber(operacion.porcentaje_honorarios_asesor)}%
                  </td>
                  <td className="py-3 px-4 before:content-['% Honorarios Agencia:'] md:before:content-none">
                    {formatNumber(operacion.honorarios_brutos)}%
                  </td>
                  <td className="py-3 px-4 before:content-['Honorarios Netos:'] md:before:content-none">
                    ${formatNumber(operacion.valor_neto)}
                  </td>
                  <td className="py-3 px-4 md:before:content-none">
                    <button
                      onClick={() =>
                        handleEstadoChange(operacion.id, operacion.estado)
                      }
                      className={`
                        ${
                          operacion.estado === "En Curso"
                            ? `${COLORS.buttonBgEnCurso} ${COLORS.buttonHoverEnCurso}`
                            : `${COLORS.buttonBgCerrada} ${COLORS.buttonHoverCerrada}`
                        } 
                        text-white p-2 px-6 rounded transition duration-150 ease-in-out text-sm w-[110px]
                      `}
                    >
                      {operacion.estado}
                    </button>
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr
                className={`font-bold hidden md:table-row ${COLORS.headerBg}`}
              >
                <td className="py-3 px-4" colSpan={7}>
                  Total
                </td>
                <td className={`py-3 px-4 ${COLORS.headerText}`}>
                  ${formatNumber(Number(totals.valor_reserva))}
                </td>
                <td className={`py-3 px-4 ${COLORS.headerText}`}>
                  {formatNumber(Number(totals.porcentaje_honorarios_asesor))}%
                </td>
                <td className={`py-3 px-4 ${COLORS.headerText}`}>
                  {formatNumber(Number(totals.honorarios_brutos))}%
                </td>
                <td className={`py-3 px-4 ${COLORS.headerText}`} colSpan={2}>
                  ${formatNumber(Number(totals.valor_neto))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OperationsList;
