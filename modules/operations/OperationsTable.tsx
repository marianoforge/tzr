import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassPlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';

import {
  fetchUserOperations,
  deleteOperation,
  updateOperation,
} from '@/lib/api/operationsApi';
import { auth } from '@/lib/firebase';
import { formatNumber } from '@/common/utils/formatNumber';
import { OPERATIONS_LIST_COLORS } from '@/lib/constants';
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
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import {
  monthsFilter,
  operationVentasTypeFilter,
  statusOptions,
} from '@/lib/data';
import { yearsFilter } from '@/lib/data';
import { OperationStatus, OperationType, QueryKeys } from '@/common/enums';

const OperationsTable: React.FC = () => {
  const [userUID, setUserUID] = useState<string | null>(null);
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

  const router = useRouter();
  const queryClient = useQueryClient();
  const { userData } = useUserDataStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const itemsPerPage = 10;

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
  } = useQuery({
    queryKey: [QueryKeys.OPERATIONS, userUID],
    queryFn: () => fetchUserOperations(userUID || ''),
    enabled: !!userUID,
  });

  const transformedOperations = useMemo(() => {
    return operations
      ?.map((operation: Operation) => {
        if (operation.tipo_operacion === OperationType.DESARROLLO) {
          return {
            ...operation,
            tipo_operacion: OperationType.DESARROLLO_INMOBILIARIO,
          };
        }
        return operation;
      })
      .filter(
        (operation: Operation) =>
          !operation.tipo_operacion.startsWith('Alquiler')
      );
  }, [operations]);

  const deleteMutation = useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, userUID],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Operation> }) =>
      updateOperation({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, userUID],
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

    const typeFilteredOps =
      operationTypeFilter === 'all'
        ? filteredOps
        : filteredOps?.filter(
            (op) => op.tipo_operacion === operationTypeFilter
          );

    const searchedOps = filterOperationsBySearch(
      typeFilteredOps || [],
      searchQuery
    );

    const nonFallenOps = searchedOps.filter(
      (op) => op.estado !== OperationStatus.CAIDA
    );

    const dateSortedOps = nonFallenOps.sort((a, b) => {
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
      const newEstado =
        currentEstado === OperationStatus.EN_CURSO
          ? OperationStatus.CERRADA
          : OperationStatus.EN_CURSO;

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

  const handleFallenOperation = useCallback(
    (id: string) => {
      const existingOperation = transformedOperations.find(
        (op: Operation) => op.id === id
      );

      if (!existingOperation) {
        console.error('Operación no encontrada');
        return;
      }

      const updatedOperation: Operation = {
        ...existingOperation,
        estado: OperationStatus.CAIDA,
      };

      updateMutation.mutate({ id: id, data: updatedOperation });
    },
    [transformedOperations, updateMutation]
  );

  const handleDeleteButtonClick = useCallback((operation: Operation) => {
    setSelectedOperation(operation);
    setIsDeleteModalOpen(true);
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

  if (isLoading) {
    return (
      <div className="mt-[70px]">
        <SkeletonLoader height={64} count={11} />
      </div>
    );
  }
  if (operationsError) {
    return (
      <p>Error: {operationsError.message || 'An unknown error occurred'}</p>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Lista de Operaciones - Ventas
      </h2>
      <div className="overflow-x-auto flex flex-col justify-around">
        <div className="flex items-center mt-2 text-mediumBlue flex-wrap">
          <div className="flex md:w-full lg:w-5/12 lg:justify-around justify-center items-center w-1/2 space-x-4">
            <input
              type="text"
              placeholder="Buscar por dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] lg:w-[150px] xl:w-[200px] 2xl:w-[250px] h-[40px] p-2 mb-8 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic text-center lg:text-sm xl:text-base"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-[200px] lg:w-[150px] xl:w-[200px] 2xl:w-[250px] h-[40px] p-2 mb-8 border border-gray-300 rounded font-semibold lg:text-sm xl:text-base"
            />
          </div>
          <div className="flex md:w-full lg:w-2/12 lg:justify-around justify-center items-center w-1/2 space-x-4">
            <Select
              options={yearsFilter}
              value={yearFilter}
              onChange={setYearFilter}
              className="w-[200px] lg:w-[150px] xl:w-[200px] 2xl:w-[250px] h-[40px] p-2 mb-8 border border-gray-300 rounded font-semibold lg:text-sm xl:text-base"
            />
          </div>
          <div className="flex md:w-full lg:w-5/12 lg:justify-around justify-center items-center w-1/2 space-x-4">
            <Select
              options={monthsFilter}
              value={monthFilter}
              onChange={setMonthFilter}
              className="w-[200px] lg:w-[150px] xl:w-[200px] 2xl:w-[250px] h-[40px] p-2 mb-8 border border-gray-300 rounded font-semibold lg:text-sm xl:text-base"
            />
            <Select
              options={operationVentasTypeFilter}
              value={operationTypeFilter}
              onChange={setOperationTypeFilter}
              className="w-[200px] lg:w-[150px] xl:w-[200px] 2xl:w-[250px] h-[40px] p-2 mb-8 border border-gray-300 rounded font-semibold lg:text-sm xl:text-base"
            />
          </div>
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
                Punta Vendedora
              </th>
              <th
                className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
              >
                Punta Compradora
              </th>

              <th
                className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold w-1/6`}
              >
                % Puntas
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
                  data-tooltip-content="Estado de la operacion C=Cerrada, A=Abierta / En Curso. Una vez cerrada la operación edita la fecha de la operacion."
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
                <td className="py-3 px-2 before:content-['Punta Vendedora:'] md:before:content-none">
                  {formatNumber(operacion.porcentaje_punta_vendedora ?? 0)}%
                </td>
                <td className="py-3 px-2 before:content-['Punta Compradora:'] md:before:content-none">
                  {formatNumber(operacion.porcentaje_punta_compradora ?? 0)}%
                </td>
                <td className="py-3 px-2 before:content-['Punta Vendedora:'] md:before:content-none">
                  {formatNumber(
                    operacion.porcentaje_punta_compradora +
                      operacion.porcentaje_punta_vendedora
                  )}
                  %
                </td>
                <td className="py-3 px-2 before:content-['Puntas:'] md:before:content-none">
                  {formatNumber(
                    Number(operacion.punta_compradora) +
                      Number(operacion.punta_vendedora)
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
                    onClick={() => handleDeleteButtonClick(operacion)}
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
              <td className="py-3 px-2 pl-10" colSpan={3}>
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
                      Number(
                        filteredTotals.promedio_punta_compradora_porcentaje
                      )
                    )}%`}
                    <InformationCircleIcon
                      className="inline-block mb-1 ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                      data-tooltip-id="tooltip-compradora"
                      data-tooltip-content="Promedio del % excluyendo alquileres y operaciones abiertas. Puntas no obtenidas / 0% (no existentes) no son tomadas en cuenta."
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
                      className="inline-block mb-1  ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                      data-tooltip-id="tooltip-vendedora"
                      data-tooltip-content="Promedio del % excluyendo alquileres y operaciones abiertas. Puntas no obtenidas / 0% (no existentes) no son tomadas en cuenta."
                    />
                    <Tooltip id="tooltip-vendedora" place="top" />
                  </>
                ) : (
                  'Cálculo no disponible'
                )}
              </td>
              <td className={styleTotalRow}>
                {filteredTotals.promedio_suma_puntas !== undefined &&
                filteredTotals.promedio_suma_puntas !== null ? (
                  <>
                    {formatNumber(Number(filteredTotals.promedio_suma_puntas))}%
                    <InformationCircleIcon
                      className="inline-block mb-1 ml-1 text-lightBlue h-4 w-4 cursor-pointer"
                      data-tooltip-id="tooltip-puntas"
                      data-tooltip-content="Promedio del % excluyendo alquileres y operaciones abiertas. Puntas no obtenidas / 0% (no existentes) no son tomadas en cuenta."
                    />
                    <Tooltip id="tooltip-puntas" place="top" />
                  </>
                ) : (
                  'Cálculo no disponible'
                )}
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
                queryKey: ['operations', userUID],
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

        <ModalDelete
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          message="¿Queres eliminar la operación o tratarla como operación caída?"
          onSecondButtonClick={() => {
            if (selectedOperation?.id) {
              handleDeleteClick(selectedOperation.id);
              setIsDeleteModalOpen(false);
            }
          }}
          secondButtonText="Borrar"
          className="w-[450px]"
          thirdButtonText="Caída"
          onThirdButtonClick={() => {
            if (selectedOperation?.id) {
              handleFallenOperation(selectedOperation.id);
              setIsDeleteModalOpen(false);
            }
          }}
        />
      </div>
    </div>
  );
};

export default OperationsTable;
