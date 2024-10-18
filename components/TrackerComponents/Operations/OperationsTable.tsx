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
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/stores/authStore";
import { Operation } from "@/types";
import { useUserDataStore } from "@/stores/userDataStore";
import { calculateTotals } from "@/utils/calculations";
import OperationsFullScreenTable from "./OperationsFullScreenTable";
import { Tooltip } from "react-tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/solid"; // Import Heroicons icon

interface OperationsTableProps {
  filter: "all" | "open" | "closed" | "currentYear" | "year2023";
  totals: ReturnType<typeof calculateTotals>;
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOperation, setViewOperation] = useState<Operation | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    const operationYear = new Date(operation.fecha_operacion).getFullYear();
    const currentYear = new Date().getFullYear();

    if (filter === "all") return true;
    if (filter === "open") return operation.estado === "En Curso";
    if (filter === "closed") return operation.estado === "Cerrada";
    if (filter === "currentYear") return operationYear === currentYear;
    if (filter === "year2023") return operationYear === 2023;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOperations = filteredOperations?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(
    (filteredOperations?.length || 0) / itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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

  const handleViewClick = (operation: Operation) => {
    setViewOperation(operation);
    setIsViewModalOpen(true);
  };

  const styleTotalRow = "py-3 px-4 text-center";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr
            className={`${OPERATIONS_LIST_COLORS.headerBg} hidden md:table-row text-center text-sm`}
          >
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Fecha de Operación
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Operación
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Tipo de Operación
            </th>

            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Valor Reserva / Cierre
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Punta Compradora
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Punta Vendedora
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Puntas
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Honorarios Brutos
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Honorarios Netos
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Estado
              <InformationCircleIcon
                className="inline-block ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                data-tooltip-id="tooltip-estado"
                data-tooltip-content="Estado de la operacion C=Cerrada, A=Abierta / En Curso"
              />
              <Tooltip id="tooltip-estado" place="top" />
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
              colSpan={3}
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {currentOperations?.map((operacion: Operation) => (
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

              <td className="py-3 px-4 before:content-['Valor:'] md:before:content-none">
                ${formatNumber(operacion.valor_reserva)}
              </td>
              <td className="py-3 px-4 before:content-['Punta Compradora:'] md:before:content-none">
                {formatNumber(operacion.porcentaje_punta_compradora ?? 0)}%
              </td>
              <td className="py-3 px-4 before:content-['Punta Vendedora:'] md:before:content-none">
                {formatNumber(operacion.porcentaje_punta_vendedora ?? 0)}%
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
              <td className="md:before:content-none text-mediumBlue text-sm font-semibold">
                <button
                  onClick={() => handleViewClick(operacion)}
                  className="text-mediumBlue hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                >
                  <MagnifyingGlassPlusIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
          <tr
            className={`font-bold hidden md:table-row ${OPERATIONS_LIST_COLORS.headerBg}`}
          >
            <td className="py-3 px-4 pl-10" colSpan={3}>
              Total
            </td>
            <td className={styleTotalRow}>
              ${formatNumber(Number(totals.valor_reserva))}
            </td>
            <td className={styleTotalRow}>
              {totals.promedio_punta_compradora_porcentaje !== undefined &&
              totals.promedio_punta_compradora_porcentaje !== null ? (
                <>
                  {`${formatNumber(
                    Number(totals.promedio_punta_compradora_porcentaje)
                  )}%`}
                  <InformationCircleIcon
                    className="inline-block ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                    data-tooltip-id="tooltip-compradora"
                    data-tooltip-content="Promedio del % sin incluir alquileres ni puntas en 0 (no existentes)."
                  />
                  <Tooltip id="tooltip-compradora" place="top" />
                </>
              ) : (
                "Cálculo no disponible"
              )}
            </td>
            <td className={styleTotalRow}>
              {totals.promedio_punta_vendedora_porcentaje !== undefined &&
              totals.promedio_punta_vendedora_porcentaje !== null ? (
                <>
                  {`${formatNumber(
                    Number(totals.promedio_punta_vendedora_porcentaje)
                  )}%`}
                  <InformationCircleIcon
                    className="inline-block ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                    data-tooltip-id="tooltip-vendedora"
                    data-tooltip-content="Promedio del % sin incluir alquileres ni puntas en 0 (no existentes)."
                  />
                  <Tooltip id="tooltip-vendedora" place="top" />
                </>
              ) : (
                "Cálculo no disponible"
              )}
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
            <td className={styleTotalRow} colSpan={4}></td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
        >
          Anterior
        </button>
        <span className="px-4 py-2 mx-1">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
        >
          Siguiente
        </button>
      </div>
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
      {isViewModalOpen && viewOperation && (
        <OperationsFullScreenTable
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          operation={viewOperation}
        />
      )}
    </div>
  );
};

export default OperationsTable;
