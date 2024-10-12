import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserOperations,
  deleteOperation,
  updateOperation,
} from "@/lib/api/operationsApi";
import { formatNumber } from "@/utils/formatNumber";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";
import Loader from "../Loader";
import OperationsModal from "./OperationsModal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/stores/authStore";
import { Operation } from "@/types";
import { useUserDataStore } from "@/stores/userDataStore";

interface OperationsTableProps {
  filter: "all" | "open" | "closed";
  totals: {
    valor_reserva: number;
    suma_total_de_puntas: number;
    honorarios_broker: number;
    honorarios_asesor: number;
  };
}

const OperationsTable: React.FC<OperationsTableProps> = ({
  filter,
  totals,
}) => {
  const { userID } = useAuthStore();
  const queryClient = useQueryClient();
  const { userData } = useUserDataStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );

  // Obtener las operaciones del usuario usando Tanstack Query
  const { data: operations, isLoading } = useQuery({
    queryKey: ["operations", userID || ""],
    queryFn: () => fetchUserOperations(userID || ""),
    enabled: !!userID, // Solo ejecuta la consulta si userID está definido
  });

  // Mutación para eliminar operación
  const deleteMutation = useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["operations", userID],
      });
    },
  });

  // Mutación para actualizar el estado de la operación
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Operation> }) =>
      updateOperation({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["operations", userID],
      });
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  const filteredOperations = operations?.filter((operation: Operation) => {
    if (filter === "all") return true;
    return filter === "open"
      ? operation.estado === "En Curso"
      : operation.estado === "Cerrada";
  });

  const handleEstadoChange = (id: string, currentEstado: string) => {
    const newEstado = currentEstado === "En Curso" ? "Cerrada" : "En Curso";

    // Buscar la operación existente en la lista de operaciones
    const existingOperation = operations.find((op: Operation) => op.id === id);

    // Si no se encuentra la operación, no hacer nada
    if (!existingOperation) {
      console.error("Operación no encontrada");
      return;
    }

    // Crear un nuevo objeto con todas las propiedades de la operación existente
    // y actualizar solo el campo "estado"
    const updatedOperation: Operation = {
      ...existingOperation, // Mantener todas las propiedades originales
      estado: newEstado, // Modificar solo el estado
    };

    // Ejecutar la mutación de actualización con la operación completa
    updateMutation.mutate({ id: id, data: updatedOperation });
  };

  const handleDeleteClick = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEditClick = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsEditModalOpen(true);
  };

  const styleTotalRow = "py-3 px-4 text-center";

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
          {filteredOperations?.map((operacion: Operation) => (
            <tr
              key={operacion.id}
              className={`${OPERATIONS_LIST_COLORS.rowBg} hover:bg-lightBlue/10 border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out text-center`}
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
              <td className="py-3 px-4 before:content-['Puntas:'] md:before:content-none">
                {formatNumber(
                  Number(operacion.punta_vendedora) +
                    Number(operacion.punta_compradora)
                )}
              </td>
              <td className="py-3 px-4 before:content-['Honorarios Agencia:'] md:before:content-none">
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
                      ? `bg-mediumBlue`
                      : `bg-lightBlue`
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
                      <p className="h-4 w-4 text-mediumBlue flex justify-center items-center">
                        A
                      </p>
                    ) : (
                      <p className="h-4 w-4 text-lightBlue flex justify-center items-center">
                        C
                      </p>
                    )}
                  </span>
                </button>
              </td>
              <td className="md:before:content-none">
                <button
                  onClick={() => handleEditClick(operacion)}
                  className="text-darkBlue hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </td>
              <td className="md:before:content-none">
                <button
                  onClick={() => handleDeleteClick(operacion.id)}
                  className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                >
                  <TrashIcon className="text-redAccent h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
          <tr
            className={`font-bold hidden md:table-row ${OPERATIONS_LIST_COLORS.headerBg}`}
          >
            <td className="py-3 px-4 pl-10" colSpan={7}>
              Total
            </td>
            <td className={styleTotalRow}>
              ${formatNumber(Number(totals.valor_reserva))}
            </td>
            <td className={styleTotalRow}>
              {formatNumber(Number(totals.suma_total_de_puntas))}
            </td>
            <td className={styleTotalRow}>
              ${formatNumber(Number(totals.honorarios_broker))}
            </td>
            <td className={styleTotalRow}>
              ${formatNumber(Number(totals.honorarios_asesor))}
            </td>
            <td className={styleTotalRow} colSpan={3}></td>
          </tr>
        </tbody>
      </table>
      {isEditModalOpen && (
        <OperationsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          operation={selectedOperation}
          onUpdate={() =>
            queryClient.invalidateQueries({ queryKey: ["operations", userID] })
          }
          currentUser={userData!}
        />
      )}
    </div>
  );
};

export default OperationsTable;
