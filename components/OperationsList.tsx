// components/OperationsList.tsx
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { formatNumber } from "@/utils/formatNumber";
import { useOperationsStore } from "@/stores/useOperationsStore";
import Loader from "./Loader";
import axios from "axios";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";

const OperationsList: React.FC = () => {
  const { operations, totals, setOperations, calculateTotals, isLoading } =
    useOperationsStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();

  const handleEstadoChange = async (id: string, currentEstado: string) => {
    const newEstado = currentEstado === "En Curso" ? "Cerrada" : "En Curso";
    try {
      const response = await axios.post(`/api/updateOperationStatus`, {
        id,
        estado: newEstado,
      });

      if (response.status !== 200) {
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

  useEffect(() => {
    const fetchOperations = async () => {
      if (!userUID) return;

      try {
        const response = await axios.get(`/api/operations/user/${userUID}`);

        if (response.status !== 200) {
          throw new Error("Error al obtener las operaciones del usuario");
        }

        const data = response.data;
        setOperations(data);
        calculateTotals();
      } catch (error) {
        console.error("Error al obtener las operaciones:", error);
      }
    };

    fetchOperations();
  }, [userUID, setOperations, calculateTotals]);

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
              <tr
                className={`${OPERATIONS_LIST_COLORS.headerBg} hidden md:table-row text-center`}
              >
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Fecha de Operación
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Dirección de Reserva
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Tipo de Operación
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Referido
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Compartido
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Sobre de Reserva
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Sobre de Refuerzo
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Valor Reserva
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Puntas
                </th>

                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Honorarios Totales Brutos
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Honorarios Totales Netos
                </th>
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                >
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {operations.map((operacion) => (
                <tr
                  key={operacion.id}
                  className={`${OPERATIONS_LIST_COLORS.rowBg} ${OPERATIONS_LIST_COLORS.rowHover} border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out text-center`}
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
                  <td className="py-3 px-4 before:content-['Valor Reserva:'] md:before:content-none">
                    {formatNumber(
                      operacion.punta_vendedora + operacion.punta_compradora
                    )}
                  </td>

                  <td className="py-3 px-4 before:content-['% Honorarios Agencia:'] md:before:content-none">
                    ${formatNumber(operacion.honorarios_broker)}
                  </td>
                  <td className="py-3 px-4 before:content-['Honorarios Netos:'] md:before:content-none">
                    ${formatNumber(operacion.honorarios_asesor)}
                  </td>
                  <td className="py-3 px-4 md:before:content-none">
                    <button
                      onClick={() =>
                        handleEstadoChange(operacion.id, operacion.estado)
                      }
                      className={`
                        ${
                          operacion.estado === "En Curso"
                            ? `${OPERATIONS_LIST_COLORS.buttonBgEnCurso} ${OPERATIONS_LIST_COLORS.buttonHoverEnCurso}`
                            : `${OPERATIONS_LIST_COLORS.buttonBgCerrada} ${OPERATIONS_LIST_COLORS.buttonHoverCerrada}`
                        } 
                        text-white p-2 px-6 rounded transition duration-150 ease-in-out text-sm w-[110px] font-semibold
                      `}
                    >
                      {operacion.estado}
                    </button>
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr
                className={`font-bold hidden md:table-row ${OPERATIONS_LIST_COLORS.headerBg} `}
              >
                <td className="py-3 px-4" colSpan={7}>
                  Total
                </td>
                <td
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
                >
                  ${formatNumber(Number(totals.valor_reserva))}
                </td>
                <td
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
                >
                  {formatNumber(Number(totals.suma_total_de_puntas))}
                </td>
                <td
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
                >
                  {formatNumber(Number(totals.porcentaje_honorarios_asesor))}%
                </td>

                <td
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
                >
                  ${formatNumber(Number(totals.honorarios_broker))}
                </td>
                <td
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
                >
                  ${formatNumber(Number(totals.honorarios_asesor))}
                </td>
                <td
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText}`}
                ></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OperationsList;
