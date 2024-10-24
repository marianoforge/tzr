import React, { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassPlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/solid'; // Import Heroicons icon

import {
  fetchUserOperations,
  deleteOperation,
  updateOperation,
} from '@/lib/api/operationsApi';
import { formatNumber } from '@/utils/formatNumber';
import { OPERATIONS_LIST_COLORS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { Operation } from '@/types';
import { useUserDataStore } from '@/stores/userDataStore';
import { calculateTotals } from '@/utils/calculations';
import { filteredOperations } from '@/utils/filteredOperations';
import { filterOperationsBySearch } from '@/utils/filterOperations';
import { sortOperationValue } from '@/utils/sortUtils'; // Import the sorting utility

import OperationsFullScreenTable from './OperationsFullScreenTable';
import OperationsModal from './OperationsModal';

const OperationsTable: React.FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOperation, setViewOperation] = useState<Operation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState(''); // Add search query state
  const [isValueAscending, setIsValueAscending] = useState<boolean | null>(
    null
  ); // Add state for sorting order

  const { userID } = useAuthStore();
  const queryClient = useQueryClient();
  const { userData } = useUserDataStore();

  const itemsPerPage = 10;

  const { data: operations } = useQuery({
    queryKey: ['operations', userID || ''],
    queryFn: () => fetchUserOperations(userID || ''),
    enabled: !!userID,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['operations', userID],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Operation> }) =>
      updateOperation({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['operations', userID],
      });
    },
  });

  // Calculate filtered operations and totals
  const { currentOperations, filteredTotals } = useMemo(() => {
    const filteredOps = filteredOperations(
      operations,
      statusFilter,
      yearFilter,
      monthFilter
    );

    // Filter operations by search query
    const searchedOps = filterOperationsBySearch(
      filteredOps || [],
      searchQuery
    );

    // Sort operations by date in descending order (newest first)
    const dateSortedOps = searchedOps.sort((a, b) => {
      return b.fecha_operacion.localeCompare(a.fecha_operacion);
    });

    // If additional sorting is needed, apply it after date sorting
    const sortedOps =
      isValueAscending !== null
        ? sortOperationValue(dateSortedOps, isValueAscending)
        : dateSortedOps;

    const totals = calculateTotals(sortedOps);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOps = sortedOps.slice(indexOfFirstItem, indexOfLastItem);

    return { currentOperations: currentOps, filteredTotals: totals };
  }, [
    operations,
    statusFilter,
    yearFilter,
    monthFilter,
    currentPage,
    itemsPerPage,
    searchQuery,
    isValueAscending,
  ]);

  const totalPages = useMemo(() => {
    return Math.ceil(
      (filteredOperations(operations, statusFilter, yearFilter, monthFilter)
        ?.length || 0) / itemsPerPage
    );
  }, [operations, statusFilter, yearFilter, monthFilter, itemsPerPage]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleEstadoChange = useCallback(
    (id: string, currentEstado: string) => {
      const newEstado = currentEstado === 'En Curso' ? 'Cerrada' : 'En Curso';

      const existingOperation = operations.find(
        (op: Operation) => op.id === id
      );

      if (!existingOperation) {
        console.error('Operación no encontrada');
        return;
      }

      const updatedOperation: Operation = {
        ...existingOperation,
        estado: newEstado,
      };

      updateMutation.mutate({ id: id, data: updatedOperation });
    },
    [operations, updateMutation]
  );

  const handleDeleteClick = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleEditClick = useCallback((operation: Operation) => {
    setSelectedOperation(operation);
    setIsEditModalOpen(true);
  }, []);

  const handleViewClick = useCallback((operation: Operation) => {
    setViewOperation(operation);
    setIsViewModalOpen(true);
  }, []);

  const styleTotalRow = 'py-3 px-4 text-center';

  const formatDate = (date: string | null) => {
    if (!date) return 'Fecha inválida';

    try {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formateando la fecha:', error);
      return 'Fecha inválida';
    }
  };

  const toggleValueSortOrder = () => {
    setIsValueAscending(!isValueAscending);
  };

  return (
    <div className="overflow-x-auto flex flex-col justify-around">
      <div className="flex justify-center items-center mt-2 gap-16 text-mediumBlue">
        <input
          type="text"
          placeholder="Buscar Propiedad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[220px] p-2 mb-8 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic"
        />
        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
          className="w-[220px] p-2 mb-8 border border-gray-300 rounded font-semibold"
        >
          <option value="all">Todas las Operaciones</option>
          <option value="open">En Curso / Reservas</option>
          <option value="closed">Operaciones Cerradas</option>
        </select>
        <select
          onChange={(e) => setYearFilter(e.target.value)}
          value={yearFilter}
          className="w-[220px] p-2 mb-8 border border-gray-300 rounded font-semibold"
        >
          <option value="all">Todos los Años</option>
          <option value="currentYear">Año Actual</option>
          <option value="year2023">Año 2023</option>
        </select>
        <select
          onChange={(e) => setMonthFilter(e.target.value)}
          value={monthFilter}
          className="w-[220px] p-2 mb-8 border border-gray-300 rounded font-semibold"
        >
          <option value="all">Todos los Meses</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-lightBlue/10 hidden md:table-row text-center text-sm">
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Fecha de Operación
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-1/5`}
            >
              Operación
            </th>
            <th
              className={`py-3  ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-[160px] cursor-pointer flex items-center justify-center `}
            >
              Tipo de Operación
            </th>

            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-1/6`}
              onClick={toggleValueSortOrder}
            >
              Valor Operación
              <span className="ml-2 text-xs text-mediumBlue inline-flex items-center justify-center ">
                {isValueAscending ? (
                  <ArrowUpIcon
                    className="h-4 w-4 text-mediumBlue"
                    strokeWidth={3}
                  /> // Use ArrowUpIcon for ascending
                ) : (
                  <ArrowDownIcon
                    className="h-4 w-4 text-mediumBlue"
                    strokeWidth={3}
                  /> // Use ArrowDownIcon for descending
                )}
              </span>
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
              className={`flex items-center gap-1 py-8 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
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
          {currentOperations?.map((operacion: Operation, index: number) => (
            <tr
              key={operacion.id}
              className={`${
                index % 2 === 0 ? 'bg-white' : 'bg-mediumBlue/10'
              } hover:bg-lightBlue/10 border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out text-center h-[75px] max-h-[75px]`}
            >
              <td className="py-3 px-4 before:content-['Fecha:'] md:before:content-none">
                {formatDate(operacion.fecha_operacion)}
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
                    operacion.estado === 'En Curso'
                      ? `bg-mediumBlue`
                      : `bg-lightBlue`
                  }`}
                >
                  <span
                    className={`${
                      operacion.estado === 'En Curso'
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    } inline-block w-4 h-4 transform bg-white rounded-full transition duration-150 ease-in-out`}
                  >
                    {operacion.estado === 'En Curso' ? (
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
            className={`font-bold hidden md:table-row bg-lightBlue/10 h-[75px]`}
          >
            <td className="py-3 px-4 pl-10" colSpan={3}>
              Total
            </td>
            <td className={styleTotalRow}>
              ${formatNumber(Number(filteredTotals.valor_reserva))}
            </td>
            <td className={styleTotalRow}>
              {filteredTotals.promedio_punta_compradora_porcentaje !==
                undefined &&
              filteredTotals.promedio_punta_compradora_porcentaje !== null ? (
                <>
                  {`${formatNumber(
                    Number(filteredTotals.promedio_punta_compradora_porcentaje)
                  )}%`}
                  <InformationCircleIcon
                    className="inline-block ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                    data-tooltip-id="tooltip-compradora"
                    data-tooltip-content="Promedio del % incluyendo solamente ventas y desarrollos. Otras operaciones y puntas no obtenidas / 0% (no existentes) no son tomadas en cuenta."
                  />
                  <Tooltip id="tooltip-compradora" place="top" />
                </>
              ) : (
                'Cálculo no disponible'
              )}
            </td>
            <td className={styleTotalRow}>
              {filteredTotals.promedio_punta_vendedora_porcentaje !==
                undefined &&
              filteredTotals.promedio_punta_vendedora_porcentaje !== null ? (
                <>
                  {`${formatNumber(
                    Number(filteredTotals.promedio_punta_vendedora_porcentaje)
                  )}%`}
                  <InformationCircleIcon
                    className="inline-block ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                    data-tooltip-id="tooltip-vendedora"
                    data-tooltip-content="Promedio del % incluyendo solamente ventas y desarrollos. Otras operaciones y puntas no obtenidas / 0% (no existentes) no son tomadas en cuenta."
                  />
                  <Tooltip id="tooltip-vendedora" place="top" />
                </>
              ) : (
                'C��lculo no disponible'
              )}
            </td>

            <td className={styleTotalRow}>
              {formatNumber(Number(filteredTotals.suma_total_de_puntas))}
            </td>
            <td className={styleTotalRow}>
              ${formatNumber(Number(filteredTotals.honorarios_broker))}
            </td>
            <td className={styleTotalRow}>
              ${formatNumber(Number(filteredTotals.honorarios_asesor))}
            </td>
            <td className={styleTotalRow} colSpan={4}></td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-center mt-4 mb-4">
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
            queryClient.invalidateQueries({ queryKey: ['operations', userID] })
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
