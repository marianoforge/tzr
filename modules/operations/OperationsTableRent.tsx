import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchUserOperations,
  deleteOperation,
  updateOperation,
} from '@/lib/api/operationsApi';
import { useAuthStore } from '@/stores/authStore';
import { useCalculationsStore } from '@/stores';
import { Operation, UserData } from '@/common/types/';
import { useUserDataStore } from '@/stores/userDataStore';
import { calculateTotals } from '@/common/utils/calculations';
import { filteredOperations } from '@/common/utils/filteredOperations';
import { filterOperationsBySearch } from '@/common/utils/filterOperationsBySearch';
import { sortOperationValue } from '@/common/utils/sortUtils';
import ModalDelete from '@/components/PrivateComponente/CommonComponents/Modal';
import {
  monthsFilter,
  operationVentasTypeFilterRent,
  statusOptions,
  yearsFilter,
} from '@/lib/data';
import { ALQUILER, OperationStatus, QueryKeys, UserRole } from '@/common/enums';
import { useUserCurrencySymbol } from '@/common/hooks/useUserCurrencySymbol';
import { calculateNetFees } from '@/common/utils/calculateNetFees';

import OperationsTableFilters from './OperationsTableFilter';
import OperationsTableBody from './OperationsTableBody';
import OperationsTableHeader from './OperationsTableHeader';
import OperationsModal from './OperationsModal';
import OperationsFullScreenTable from './OperationsFullScreenTable';
import OperationsMobileView from './OperationsMobileView';
import OperationsTabletView from './OperationsTabletView';
import OperationsMobileFilters from './OperationsMobileFilters';
import OperationsModernGridView from './OperationsModernGridView';
import OperationsModernTableView from './OperationsModernTableView';
import OperationsViewSelector, { ViewType } from './OperationsViewSelector';

const OperationsTableTent: React.FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOperation, setViewOperation] = useState<Operation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );
  const [monthFilter, setMonthFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isValueAscending, setIsValueAscending] = useState<boolean | null>(
    null
  );
  const [operationTypeFilter, setOperationTypeFilter] = useState('all');
  const [isReservaDateAscending, setIsReservaDateAscending] = useState<
    boolean | null
  >(null);
  const [isClosingDateAscending, setIsClosingDateAscending] = useState<
    boolean | null
  >(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filteredHonorarios, setFilteredHonorarios] = useState({
    brutos: 0,
    netos: 0,
  });
  const [desktopView, setDesktopView] = useState<ViewType>('original');

  const { userID } = useAuthStore();
  const queryClient = useQueryClient();
  const { userData } = useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userID || '');
  const {
    setOperations,
    setUserData,
    setUserRole,
    calculateResults,
    calculateResultsByFilters,
  } = useCalculationsStore();

  const itemsPerPage = 10;

  const {
    data: operations = [],
    isLoading,
    error: operationsError,
    isSuccess: operationsLoaded,
  } = useQuery({
    queryKey: ['operations', userID || ''],
    queryFn: () => fetchUserOperations(userID || ''),
    enabled: !!userID,
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false,
  });

  const transformedOperations = useMemo(() => {
    return operations
      ?.map((operation: Operation) => {
        return operation;
      })
      .filter((operation: Operation) =>
        operation.tipo_operacion.startsWith(ALQUILER.ALQUILER)
      );
  }, [operations]);

  // Configurar los datos en el store cuando las operaciones se cargan
  useEffect(() => {
    const updateStore = async () => {
      if (transformedOperations.length > 0 && userData) {
        // Configuramos las operaciones en el store
        setOperations(transformedOperations);

        // Configuramos los datos del usuario
        setUserData(userData);

        // Configuramos el rol del usuario
        if (userData.role) {
          setUserRole(userData.role as UserRole);
        }

        // Calculamos los resultados generales
        calculateResults();

        // Calculamos los resultados filtrados para la tabla actual
        const filtered = calculateResultsByFilters(yearFilter, statusFilter);
        setFilteredHonorarios({
          brutos: filtered.honorariosBrutos,
          netos: filtered.honorariosNetos,
        });
      }
    };

    if (operationsLoaded) {
      updateStore();
    }
  }, [
    transformedOperations,
    userData,
    operationsLoaded,
    yearFilter,
    statusFilter,
    setOperations,
    setUserData,
    setUserRole,
    calculateResults,
    calculateResultsByFilters,
  ]);

  // Actualizar los honorarios filtrados cuando cambien los filtros
  useEffect(() => {
    if (transformedOperations.length > 0 && userData) {
      const filtered = calculateResultsByFilters(yearFilter, statusFilter);
      setFilteredHonorarios({
        brutos: filtered.honorariosBrutos,
        netos: filtered.honorariosNetos,
      });
    }
  }, [
    yearFilter,
    statusFilter,
    transformedOperations,
    userData,
    calculateResultsByFilters,
  ]);

  const deleteMutation = useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, userID],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Operation> }) =>
      updateOperation({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, userID],
      });
    },
  });

  const { currentOperations, filteredTotals, calculatedHonorarios } =
    useMemo(() => {
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

      const allOps = searchedOps.filter((op) => {
        if (statusFilter === OperationStatus.CAIDA) {
          return op.estado === OperationStatus.CAIDA;
        } else if (statusFilter === 'all') {
          // Si el filtro es 'all', excluir operaciones CAIDA
          return op.estado !== OperationStatus.CAIDA;
        } else {
          // Si es otro estado específico (EN_CURSO, CERRADA), mostrar solo ese estado
          return op.estado === statusFilter;
        }
      });

      const dateSortedOps = allOps.sort((a, b) => {
        return b.fecha_operacion.localeCompare(a.fecha_operacion);
      });

      const sortedOps =
        isValueAscending !== null
          ? sortOperationValue(dateSortedOps, isValueAscending)
          : isReservaDateAscending !== null
            ? dateSortedOps.sort((a, b) => {
                // Ordenar por fecha_reserva para la columna de Reserva
                const aDate = a.fecha_reserva || '';
                const bDate = b.fecha_reserva || '';

                // Si ambas fechas están vacías, mantener el orden original
                if (!aDate && !bDate) return 0;
                // Si solo aDate está vacía, debe ir al final
                if (!aDate) return isReservaDateAscending ? 1 : -1;
                // Si solo bDate está vacía, debe ir al final
                if (!bDate) return isReservaDateAscending ? -1 : 1;

                // Comparación normal para fechas no vacías
                return isReservaDateAscending
                  ? aDate.localeCompare(bDate)
                  : bDate.localeCompare(aDate);
              })
            : isClosingDateAscending !== null
              ? dateSortedOps.sort((a, b) => {
                  // Ordenar por fecha_operacion para la columna de Cierre
                  const aOp = a.fecha_operacion || '';
                  const bOp = b.fecha_operacion || '';

                  // Si ambas fechas están vacías, mantener el orden original
                  if (!aOp && !bOp) return 0;
                  // Si solo aOp está vacía, debe ir al final
                  if (!aOp) return isClosingDateAscending ? 1 : -1;
                  // Si solo bOp está vacía, debe ir al final
                  if (!bOp) return isClosingDateAscending ? -1 : 1;

                  // Comparación normal para fechas no vacías
                  return isClosingDateAscending
                    ? aOp.localeCompare(bOp)
                    : bOp.localeCompare(aOp);
                })
              : dateSortedOps;

      const totals = calculateTotals(sortedOps);

      // Calcular las puntas correctamente considerando el filtro actual
      const puntaCompradora = sortedOps.reduce((sum, operation) => {
        return sum + (operation.punta_compradora ? 1 : 0);
      }, 0);

      const puntaVendedora = sortedOps.reduce((sum, operation) => {
        return sum + (operation.punta_vendedora ? 1 : 0);
      }, 0);

      const sumaTotalDePuntas = puntaCompradora + puntaVendedora;

      // Sobrescribir los valores de puntas en totals con los calculados correctamente
      const correctedTotals = {
        ...totals,
        punta_compradora: puntaCompradora,
        punta_vendedora: puntaVendedora,
        suma_total_de_puntas: sumaTotalDePuntas,
      };

      // Calcular los honorarios filtrados aquí sin actualizar el estado
      const honorariosBrutos = totals.honorarios_broker || 0;
      let honorariosNetos = 0;

      // Verificar que userData existe antes de calcular
      if (userData) {
        honorariosNetos = sortedOps.reduce(
          (total, op) => total + calculateNetFees(op, userData as UserData),
          0
        );
      }

      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentOps = sortedOps.slice(indexOfFirstItem, indexOfLastItem);

      return {
        currentOperations: currentOps,
        filteredTotals: correctedTotals,
        calculatedHonorarios: {
          brutos: honorariosBrutos,
          netos: honorariosNetos,
        },
      };
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
      isReservaDateAscending,
      isClosingDateAscending,
      userData,
    ]);

  // Actualizar el estado fuera del useMemo en un useEffect
  useEffect(() => {
    if (calculatedHonorarios) {
      setFilteredHonorarios(calculatedHonorarios);
    }
  }, [calculatedHonorarios]);

  const totalPages = useMemo(() => {
    // Usar exactamente la misma lógica de filtrado que currentOperations
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

    const allOps = searchedOps.filter((op) => {
      if (statusFilter === OperationStatus.CAIDA) {
        return op.estado === OperationStatus.CAIDA;
      } else if (statusFilter === 'all') {
        // Si el filtro es 'all', excluir operaciones CAIDA
        return op.estado !== OperationStatus.CAIDA;
      } else {
        // Si es otro estado específico (EN_CURSO, CERRADA), mostrar solo ese estado
        return op.estado === statusFilter;
      }
    });

    return Math.ceil((allOps.length || 0) / itemsPerPage);
  }, [
    transformedOperations,
    statusFilter,
    yearFilter,
    monthFilter,
    operationTypeFilter,
    searchQuery,
    itemsPerPage,
  ]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, yearFilter, monthFilter, operationTypeFilter, searchQuery]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      // Validar que la página esté en el rango válido
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalPages]
  );

  // Validar y ajustar página actual si está fuera del rango
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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

  const toggleValueSortOrder = () => {
    setIsValueAscending(!isValueAscending);
    setIsReservaDateAscending(null);
    setIsClosingDateAscending(null);
  };

  const toggleReservaDateSortOrder = () => {
    setIsReservaDateAscending(!isReservaDateAscending);
    setIsValueAscending(null);
    setIsClosingDateAscending(null);
  };

  const toggleClosingDateSortOrder = () => {
    setIsClosingDateAscending(!isClosingDateAscending);
    setIsValueAscending(null);
    setIsReservaDateAscending(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Lista de Operaciones - Alquileres
        </h2>
        <p className="text-center">Cargando datos...</p>
      </div>
    );
  }

  if (operationsError) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Lista de Operaciones - Alquileres
        </h2>
        <p className="text-center text-red-500">
          Error: {operationsError.message || 'An unknown error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Lista de Operaciones - Alquileres
      </h2>
      <div className="overflow-x-auto flex flex-col justify-around">
        {/* Filtros originales solo para desktop */}
        <div className="hidden lg:block">
          <OperationsTableFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            yearFilter={yearFilter}
            setYearFilter={(year: string) => setYearFilter(year)}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            operationTypeFilter={operationTypeFilter}
            setOperationTypeFilter={setOperationTypeFilter}
            statusOptions={statusOptions}
            yearsFilter={yearsFilter}
            monthsFilter={monthsFilter}
            operationVentasTypeFilter={operationVentasTypeFilterRent}
          />
        </div>

        {/* Vista móvil para pantallas pequeñas */}
        <div className="block md:hidden">
          <OperationsMobileFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            yearFilter={yearFilter}
            setYearFilter={(year: string) => setYearFilter(year)}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            operationTypeFilter={operationTypeFilter}
            setOperationTypeFilter={setOperationTypeFilter}
            statusOptions={statusOptions}
            yearsFilter={yearsFilter}
            monthsFilter={monthsFilter}
            operationVentasTypeFilter={operationVentasTypeFilterRent}
          />
          <OperationsMobileView
            operations={currentOperations}
            userData={userData as UserData}
            currencySymbol={currencySymbol}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteButtonClick}
            onViewClick={handleViewClick}
            onStatusChange={handleEstadoChange}
          />
        </div>

        {/* Vista tablet para pantallas medianas */}
        <div className="hidden md:block lg:hidden">
          <OperationsTabletView
            operations={currentOperations}
            userData={userData as UserData}
            currencySymbol={currencySymbol}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteButtonClick}
            onViewClick={handleViewClick}
            onStatusChange={handleEstadoChange}
          />
        </div>

        {/* Vista de tabla para pantallas grandes */}
        <div className="hidden lg:block">
          <OperationsViewSelector
            currentView={desktopView}
            onViewChange={setDesktopView}
          />

          {desktopView === 'grid' && (
            <OperationsModernGridView
              operations={currentOperations}
              userData={userData as UserData}
              currencySymbol={currencySymbol}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteButtonClick}
              onViewClick={handleViewClick}
              onStatusChange={handleEstadoChange}
            />
          )}

          {desktopView === 'table' && (
            <OperationsModernTableView
              operations={currentOperations}
              userData={userData as UserData}
              currencySymbol={currencySymbol}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteButtonClick}
              onViewClick={handleViewClick}
              onStatusChange={handleEstadoChange}
              isReservaDateAscending={isReservaDateAscending}
              isClosingDateAscending={isClosingDateAscending}
              isValueAscending={isValueAscending}
              toggleReservaDateSortOrder={toggleReservaDateSortOrder}
              toggleClosingDateSortOrder={toggleClosingDateSortOrder}
              toggleValueSortOrder={toggleValueSortOrder}
              filteredTotals={filteredTotals}
              totalNetFees={filteredHonorarios.netos}
            />
          )}

          {desktopView === 'original' && (
            <table className="w-full text-left border-collapse">
              <OperationsTableHeader
                isReservaDateAscending={isReservaDateAscending}
                isClosingDateAscending={isClosingDateAscending}
                isValueAscending={isValueAscending}
                toggleReservaDateSortOrder={toggleReservaDateSortOrder}
                toggleClosingDateSortOrder={toggleClosingDateSortOrder}
                toggleValueSortOrder={toggleValueSortOrder}
              />
              <OperationsTableBody
                currentOperations={currentOperations}
                userData={userData as UserData}
                handleEstadoChange={handleEstadoChange}
                handleEditClick={handleEditClick}
                handleDeleteButtonClick={handleDeleteButtonClick}
                handleViewClick={handleViewClick}
                filteredTotals={filteredTotals}
                currencySymbol={currencySymbol}
                totalNetFees={filteredHonorarios.netos}
                totalHonorariosBrutos={filteredHonorarios.brutos}
              />
            </table>
          )}
        </div>
        {/* Paginación mejorada */}
        {totalPages > 0 ? (
          <div className="flex flex-col sm:flex-row justify-center items-center mt-4 mb-4 space-y-2 sm:space-y-0">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink transition-opacity duration-200"
            >
              Anterior
            </button>
            <span className="px-4 py-2 mx-1 text-sm text-gray-600">
              Página {currentPage} de {totalPages}
              {currentOperations.length > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  ({currentOperations.length} resultados)
                </span>
              )}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink transition-opacity duration-200"
            >
              Siguiente
            </button>
          </div>
        ) : (
          currentOperations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                No se encontraron operaciones con los filtros aplicados.
              </p>
            </div>
          )
        )}
        {isEditModalOpen && (
          <OperationsModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            operation={
              selectedOperation
                ? {
                    ...selectedOperation,
                    exclusiva: selectedOperation.exclusiva ?? false,
                    no_exclusiva: selectedOperation.no_exclusiva ?? false,
                    fecha_reserva: selectedOperation.fecha_reserva ?? '',
                  }
                : null
            }
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
            userData={userData as UserData}
            currencySymbol={currencySymbol}
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
  );
};

export default OperationsTableTent;
