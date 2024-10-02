import React, { useEffect, useState } from "react";
import { formatNumber } from "@/utils/formatNumber";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";
import { Operation, Totals } from "@/types";
import {
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import OperationsModal from "./OperationsModal";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { useOperationsStore } from "@/stores/useOperationsStore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import Loader from "../Loader";

interface OperationsTableProps {
  operations: Operation[];
  totals: Totals;
}

const OperationsTable: React.FC<OperationsTableProps> = ({}) => {
  const { operations, totals, setItems, calculateTotals, isLoading } =
    useOperationsStore();
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
      calculateTotals();
    } catch (error) {
      console.error("Error updating operation status:", error);
    }
  };

  const handleEditClick = async (operation: Operation, id: string) => {
    setSelectedOperation(operation);
    setIsEditModalOpen(true);

    try {
      const response = await fetch(`/api/operations/${id}`, {
        // Usar id aquí
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(operation),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle successful response
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
      calculateTotals();
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
        calculateTotals();
      } catch (error) {
        console.error("Error al obtener las operaciones:", error);
      }
    };

    fetchOperations();
  }, [userUID, setItems, calculateTotals]);

  if (isLoading) {
    return <Loader />;
  }
  return (
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
                      : `bg-[#C25B33B3]`
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
                      <CheckIcon className="h-4 w-4 text-[#7ED994]" />
                    ) : (
                      <XMarkIcon className="h-4 w-4 text-[#C25B33B3]" />
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
                  className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out text-sm  font-semibold"
                >
                  <TrashIcon className="text-[#C25B33B3] h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
          <tr
            className={`font-bold hidden md:table-row ${OPERATIONS_LIST_COLORS.headerBg}`}
          >
            <td className="py-3 px-20" colSpan={3}>
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
              ${formatNumber(Number(totals.honorarios_broker))}
            </td>
            <td
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
            >
              ${formatNumber(Number(totals.honorarios_asesor))}
            </td>
            <td
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText}`}
              colSpan={3}
            ></td>
          </tr>
        </tbody>
      </table>
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

export default OperationsTable;
