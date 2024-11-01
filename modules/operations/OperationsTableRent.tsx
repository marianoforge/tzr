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
import { InformationCircleIcon } from '@heroicons/react/24/solid';

import {
  fetchUserOperations,
  deleteOperation,
  updateOperation,
} from '@/lib/api/operationsApi';
import { formatNumber } from '@/common/utils/formatNumber';
import { OPERATIONS_LIST_COLORS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { Operation } from '@/common/types/';
import { useUserDataStore } from '@/stores/userDataStore';
import { calculateTotals } from '@/common/utils/calculations';
import { filteredOperations } from '@/common/utils/filteredOperations';
import { filterOperationsBySearch } from '@/common/utils/filterOperations';
import { sortOperationValue } from '@/common/utils/sortUtils';
import Select from '@/components/PrivateComponente/CommonComponents/Select';

import OperationsFullScreenTable from './OperationsFullScreenTable';
import OperationsModal from './OperationsModal';
import ModalDelete from '@/components/PrivateComponente/CommonComponents/Modal';
import {
  monthsFilter,
  operationTypeRentFilter,
  statusOptions,
  yearsFilter,
} from '@/lib/data';
const OperationsTableTent: React.FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOperation, setViewOperation] = useState<Operation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('2024');
  const [monthFilter, setMonthFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isValueAscending, setIsValueAscending] = useState<boolean | null>(
    null
  );
  const [operationTypeFilter, setOperationTypeFilter] = useState('all');
  const [isDateAscending, setIsDateAscending] = useState<boolean | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { userID } = useAuthStore();
  const queryClient = useQueryClient();
  const { userData } = useUserDataStore();

  const itemsPerPage = 10;

  const { data: operations } = useQuery({
    queryKey: ['operations', userID || ''],
    queryFn: () => fetchUserOperations(userID || ''),
    enabled: !!userID,
  });

  const transformedOperations = useMemo(() => {
    return operations
      ?.map((operation: Operation) => {
        return operation;
      })
      .filter((operation: Operation) =>
        operation.tipo_operacion.startsWith('Alquiler')
      );
  }, [operations]);

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

  const { currentOperations, filteredTotals } = useMemo(() => {
    const filteredOps = filteredOperations(
      transformedOperations,
      statusFilter,
      yearFilter,
      monthFilter
    );

    const typeFilteredOps = filteredOps?.filter(
      (operation: Operation) =>
        operationTypeFilter === 'all' ||
        operation.tipo_operacion === operationTypeFilter
    );

    const searchedOps = filterOperationsBySearch(
      typeFilteredOps || [],
      searchQuery
    );

    const dateSortedOps = searchedOps.sort((a, b) => {
      return b.fecha_operacion.localeCompare(a.fecha_operacion);
    });

    const sortedOps =
      isValueAscending !== null
        ? sortOperationValue(dateSortedOps, isValueAscending)
        : isDateAscending !== null
          ? dateSortedOps.sort((a, b) =>
              isDateAscending
                ? a.fecha_operacion.localeCompare(b.fecha_operacion)
                : b.fecha_operacion.localeCompare(a.fecha_operacion)
            )
          : dateSortedOps;

    const totals = calculateTotals(sortedOps);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOps = sortedOps.slice(indexOfFirstItem, indexOfLastItem);

    return { currentOperations: currentOps, filteredTotals: totals };
  }, [
    transformedOperations,
    statusFilter,
    yearFilter,
    monthFilter,
    operationTypeFilter,
    currentPage,
    itemsPerPage,
    searchQuery,
    isValueAscending,
    isDateAscending,
  ]);

  const totalPages = useMemo(() => {
    return Math.ceil(
      (filteredOperations(
        transformedOperations,
        statusFilter,
        yearFilter,
        monthFilter
      )?.length || 0) / itemsPerPage
    );
  }, [
    transformedOperations,
    statusFilter,
    yearFilter,
    monthFilter,
    itemsPerPage,
  ]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleEstadoChange = useCallback(
    (id: string, currentEstado: string) => {
      const newEstado = currentEstado === 'En Curso' ? 'Cerrada' : 'En Curso';

      const existingOperation = transformedOperations.find(
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
    [transformedOperations, updateMutation]
  );

  const handleDeleteClick = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleDeleteButtonClick = useCallback((operation: Operation) => {
    setSelectedOperation(operation); // Establece la operación seleccionada
    setIsDeleteModalOpen(true); // Abre el modal de eliminación
  }, []);

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

  const toggleDateSortOrder = () => {
    setIsDateAscending(!isDateAscending);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Lista de Operaciones - Alquileres
      </h2>
      <div className="overflow-x-auto flex flex-col justify-around">
        <div className="flex justify-center items-center mt-2 gap-16 text-mediumBlue">
          <input
            type="text"
            placeholder="Buscar Propiedad por dirección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[220px] p-2 mb-8 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-[220px] p-2 mb-8 border border-gray-300 rounded font-semibold"
          />
          <Select
            options={yearsFilter}
            value={yearFilter}
            onChange={setYearFilter}
            className="w-[220px] p-2 mb-8 border border-gray-300 rounded font-semibold"
          />
          <Select
            options={monthsFilter}
            value={monthFilter}
            onChange={setMonthFilter}
            className="w-[220px] p-2 mb-8 border border-gray-300 rounded font-semibold"
          />
          <Select
            options={operationTypeRentFilter}
            value={operationTypeFilter}
            onChange={setOperationTypeFilter}
            className="w-[220px] p-2 mb-8 border border-gray-300 rounded font-semibold"
          />
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-lightBlue/10 hidden md:table-row text-center text-sm">
              <th
                className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold flex items-center justify-center`}
                onClick={toggleDateSortOrder}
              >
                Fecha de Operación
                <span className="ml-1 text-xs text-mediumBlue items-center justify-center">
                  {isDateAscending ? (
                    <ArrowUpIcon
                      className="h-4 w-4 text-mediumBlue"
                      strokeWidth={3}
                    />
                  ) : (
                    <ArrowDownIcon
                      className="h-4 w-4 text-mediumBlue"
                      strokeWidth={3}
                    />
                  )}
                </span>
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
                    />
                  ) : (
                    <ArrowDownIcon
                      className="h-4 w-4 text-mediumBlue"
                      strokeWidth={3}
                    />
                  )}
                </span>
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
                <td className="py-3 px-2 before:content-['Fecha:'] md:before:content-none">
                  {formatDate(operacion.fecha_operacion)}
                </td>
                <td className="py-3 px-2 text-sm before:content-['Dirección:'] md:before:content-none">
                  {operacion.direccion_reserva}
                </td>
                <td className="py-3 px-2 before:content-['Tipo:'] md:before:content-none">
                  {operacion.tipo_operacion}
                </td>
                <td className="py-3 px-2 before:content-['Valor:'] md:before:content-none">
                  ${formatNumber(operacion.valor_reserva)}
                </td>
                <td className="py-3 px-2 before:content-['Puntas:'] md:before:content-none">
                  {formatNumber(
                    Number(operacion.punta_vendedora) +
                      Number(operacion.punta_compradora)
                  )}
                </td>
                <td className="py-3 px-2 before:content-['Honorarios Agencia:'] md:before:content-none">
                  ${formatNumber(operacion.honorarios_broker)}
                </td>
                <td className="py-3 px-2 before:content-['Honorarios Netos:'] md:before:content-none">
                  ${formatNumber(operacion.honorarios_asesor)}
                </td>
                <td className="py-3 px-2 md:before:content-none">
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
                    onClick={() => handleDeleteButtonClick(operacion)} // Usa el nuevo manejador
                    className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                  >
                    <TrashIcon className="text-redAccent h-5 w-5" />
                  </button>
                </td>
                <td className="md:before:content-none text-mediumBlue text-sm font-semibold pr-2">
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
                {filteredTotals.suma_total_de_puntas !== undefined &&
                filteredTotals.suma_total_de_puntas !== null ? (
                  <>
                    {formatNumber(Number(filteredTotals.suma_total_de_puntas))}
                  </>
                ) : (
                  'Cálculo no disponible'
                )}
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
              queryClient.invalidateQueries({
                queryKey: ['operations', userID],
              })
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

      <ModalDelete
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        message="¿Estás seguro de querer eliminar esta operación?"
        onSecondButtonClick={() => {
          if (selectedOperation?.id) {
            handleDeleteClick(selectedOperation.id);
            setIsDeleteModalOpen(false);
          }
        }}
        secondButtonText="Borrar Operación"
        className="w-[450px]"
      />
    </div>
  );
};

export default OperationsTableTent;
