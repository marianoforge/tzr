// components/OperationsList.tsx
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { formatNumber } from "@/utils/formatNumber";
import { useOperationsStore } from "@/stores/useOperationsStore";
import Loader from "../Loader";
import axios from "axios";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";
import OperationsModal from "./OperationsModal";
import { Operation } from "@/types";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface OperationsCarouselDashProps {
  filter: "all" | "open" | "closed";
  setFilter: React.Dispatch<React.SetStateAction<"all" | "open" | "closed">>;
}

const OperationsList: React.FC<OperationsCarouselDashProps> = ({
  filter,
  setFilter,
}) => {
  const { operations, setItems, isLoading } = useOperationsStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEstadoChange = async (id: string, currentEstado: string) => {
    const newEstado = currentEstado === "En Curso" ? "Cerrada" : "En Curso";
    try {
      const response = await axios.put(`/api/operations/${id}`, {
        estado: newEstado,
      });

      if (response.status !== 200) {
        throw new Error("Error updating operation status");
      }

      setItems(
        operations.map((operacion) =>
          operacion.id === id ? { ...operacion, estado: newEstado } : operacion
        )
      );
    } catch (error) {
      console.error("Error updating operation status:", error);
    }
  };

  const handleEditClick = async (operation: Operation, id: string) => {
    setSelectedOperation(operation);
    setIsEditModalOpen(true);

    try {
      const response = await fetch(`/api/operations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(operation),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating operation:", error);
    }
  };

  const handleDeleteClick = async (id: string) => {
    try {
      const response = await axios.delete(`/api/operations/${id}`);
      if (response.status !== 200) {
        throw new Error("Error deleting operation");
      }
      setItems(operations.filter((operacion) => operacion.id !== id));
    } catch (error) {
      console.error("Error deleting operation:", error);
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
        setItems(data);
      } catch (error) {
        console.error("Error al obtener las operaciones:", error);
      }
    };

    fetchOperations();
  }, [userUID, setItems]);

  const filteredOperations = operations.filter((operation) => {
    if (filter === "all") return true;
    if (filter === "open") return operation.estado === "En Curso";
    if (filter === "closed") return operation.estado === "Cerrada";
    return true;
  });

  const calculateFilteredTotals = () => {
    return filteredOperations.reduce(
      (totals, operation) => {
        totals.valor_reserva += Number(operation.valor_reserva);
        totals.suma_total_de_puntas +=
          Number(operation.punta_vendedora) +
          Number(operation.punta_compradora);
        totals.honorarios_broker += Number(operation.honorarios_broker);
        totals.honorarios_asesor += Number(operation.honorarios_asesor);
        return totals;
      },
      {
        valor_reserva: 0,
        suma_total_de_puntas: 0,
        honorarios_broker: 0,
        honorarios_asesor: 0,
      }
    );
  };

  const filteredTotals = calculateFilteredTotals();

  if (isLoading) {
    return <Loader />;
  }

  return isLoading ? (
    <Loader />
  ) : (
    <div className="bg-white p-6 mt-14 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Lista de Operaciones
      </h2>
      <div className="flex justify-center mb-6 mt-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 mx-2 ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Todas las Operaciones
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`px-4 py-2 mx-2 ${
            filter === "open" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Operaciones Abiertas
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-4 py-2 mx-2 ${
            filter === "closed" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Operaciones Cerradas
        </button>
      </div>
      {filteredOperations.length === 0 ? (
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
                <th
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
                  colSpan={2}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOperations.map((operacion) => (
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
                      Number(operacion.punta_vendedora) +
                        Number(operacion.punta_compradora)
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
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition duration-150 ease-in-out ${
                        operacion.estado === "En Curso"
                          ? `${OPERATIONS_LIST_COLORS.buttonBgEnCurso}`
                          : `bg-redAccent`
                      }`}
                    >
                      <span
                        className={`${
                          operacion.estado === "En Curso"
                            ? "translate-x-6"
                            : "translate-x-1"
                        } inline-block w-4 h-4 transform bg-white rounded-full transition duration-150 ease-in-out`}
                      >
                        {operacion.estado === "En Curso" ? (
                          <CheckIcon className="h-4 w-4 text-greenAccent" />
                        ) : (
                          <XMarkIcon className="h-4 w-4 text-redAccent" />
                        )}
                      </span>
                    </button>
                  </td>
                  <td className="md:before:content-none">
                    <button
                      onClick={() => handleEditClick(operacion, operacion.id)}
                      className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out text-sm  font-semibold "
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="md:before:content-none">
                    <button
                      onClick={() => handleDeleteClick(operacion.id)}
                      className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm  font-semibold"
                    >
                      <TrashIcon className="text-redAccent h-5 w-5" />
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
                  ${formatNumber(Number(filteredTotals.valor_reserva))}
                </td>
                <td
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
                >
                  {formatNumber(Number(filteredTotals.suma_total_de_puntas))}
                </td>
                <td
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
                >
                  {formatNumber(Number(filteredTotals.honorarios_broker))}%
                </td>

                <td
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
                >
                  ${formatNumber(Number(filteredTotals.honorarios_asesor))}
                </td>

                <td
                  className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText}`}
                  colSpan={3}
                ></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {isEditModalOpen && (
        <OperationsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          operation={selectedOperation} // Ensure operation is either the expected object or null
        />
      )}
    </div>
  );
};

export default OperationsList;
