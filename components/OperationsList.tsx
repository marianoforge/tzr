// components/OperationsList.tsx
import { formatNumber } from "@/utils/formatNumber";
import { useEffect, useState } from "react";

interface Operacion {
  id: string;
  fecha_operacion: string;
  direccion_reserva: string;
  tipo_operacion: string;
  valor_reserva: number;
  numero_sobre_reserva: number;
  numero_sobre_refuerzo: number;
  porcentaje_honorarios_asesor: number;
  honorarios_brutos: number;
  referido: string;
  compartido: string;
  valor_neto: number;
  estado: string;
}

interface OperationsListProps {
  userID: string;
}

const OperationsList = ({ userID }: OperationsListProps) => {
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [totals, setTotals] = useState({
    valor_reserva: 0,
    porcentaje_honorarios_asesor: 0,
    honorarios_brutos: 0,
    valor_neto: 0,
  });

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

      // Update the local state to reflect the change
      setOperaciones((prevOperaciones) =>
        prevOperaciones.map((operacion) =>
          operacion.id === id ? { ...operacion, estado: newEstado } : operacion
        )
      );
    } catch (error) {
      console.error("Error updating operation status:", error);
    }
  };

  // Fetch operations data from API using the userID
  useEffect(() => {
    const fetchOperaciones = async () => {
      if (!userID) return;

      try {
        const response = await fetch(
          `/api/operationsPerUser?user_uid=${userID}`
        );
        if (!response.ok) {
          throw new Error("Error fetching operations");
        }

        const data = await response.json();
        setOperaciones(data);
        calculateTotals(data);
      } catch (error) {
        console.error("Error fetching operations:", error);
      }
    };

    fetchOperaciones();
  }, [userID]);

  // Calculate totals for each relevant column
  const calculateTotals = (operations: Operacion[]) => {
    const totalValorReserva = operations.reduce(
      (acc, op) => acc + op.valor_reserva,
      0
    );
    const totalPorcentajeHonorariosAsesor =
      operations.reduce((acc, op) => acc + op.porcentaje_honorarios_asesor, 0) /
      operations.length;

    const totalHonorariosGDS =
      operations.reduce((acc, op) => acc + op.honorarios_brutos, 0) /
      operations.length;

    const totalValorNeto = operations.reduce(
      (acc, op) => acc + op.valor_neto,
      0
    );

    setTotals({
      valor_reserva: totalValorReserva,
      porcentaje_honorarios_asesor: totalPorcentajeHonorariosAsesor,
      honorarios_brutos: totalHonorariosGDS,
      valor_neto: totalValorNeto,
    });
  };

  const COLORS = {
    headerBg: "bg-[#A8E0FF]/20",
    headerText: "text-[#5EAAD7]",
    rowBg: "bg-white",
    rowHover: "hover:bg-[#A8E0FF]/10",
    buttonBg: "bg-[#5EAAD7]",
    buttonHover: "hover:bg-[#4D8EB3]",
  };

  return (
    <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Lista de Operaciones</h2>
      {operaciones.length === 0 ? (
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
                  Porcentaje Honorarios GDS
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
              {operaciones.map((operacion) => (
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
                  <td className="py-3 px-4 before:content-['% Honorarios GDS:'] md:before:content-none">
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
                      className={`${COLORS.buttonBg} ${COLORS.buttonHover} text-white p-2 px-6 rounded transition duration-150 ease-in-out text-sm w-[110px]`}
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
                  ${formatNumber(totals.valor_reserva)}
                </td>
                <td className={`py-3 px-4 ${COLORS.headerText}`}>
                  {formatNumber(totals.porcentaje_honorarios_asesor)}%
                </td>
                <td className={`py-3 px-4 ${COLORS.headerText}`}>
                  {formatNumber(totals.honorarios_brutos)}%
                </td>
                <td className={`py-3 px-4 ${COLORS.headerText}`} colSpan={2}>
                  ${formatNumber(totals.valor_neto)}
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
