import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '@/lib/firebase';
import { Operation, UserData } from '@/common/types/';
import { useUserDataStore } from '@/stores/userDataStore';
import { useCalculationsStore } from '@/stores';
import {
  calculateTotals,
  calculateHonorarios,
} from '@/common/utils/calculations';
import { filteredOperations } from '@/common/utils/filteredOperations';
import { filterOperationsBySearch } from '@/common/utils/filterOperationsBySearch';
import { sortOperationValue } from '@/common/utils/sortUtils';
import ModalDelete from '@/components/PrivateComponente/CommonComponents/Modal';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import {
  monthsFilter,
  operationVentasTypeFilter,
  statusOptions,
  yearsFilter,
} from '@/lib/data';
import { OperationStatus, UserRole } from '@/common/enums';
import { useOperations } from '@/common/hooks/useOperactions';
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
  const [desktopView, setDesktopView] = useState<ViewType>('original');

  const router = useRouter();
  const { userData } = useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userUID || '');
  const { setOperations, setUserData, setUserRole, calculateResults } =
    useCalculationsStore();

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
    transformedOperations,
    isLoading,
    operationsError,
    deleteMutation,
    updateMutation,
    queryClient,
    isSuccess: operationsLoaded,
  } = useOperations(userUID);

  // Configurar los datos en el store cuando las operaciones se cargan
  useEffect(() => {
    const updateStore = async () => {
      if (transformedOperations.length > 0 && userData) {
        // Configuramos las operaciones
        setOperations(transformedOperations);

        // Configuramos los datos del usuario
        setUserData(userData);

        // Configuramos el rol del usuario
        if (userData.role) {
          setUserRole(userData.role as UserRole);
        }

        // Calculamos los resultados generales
        calculateResults();
      }
    };

    if (operationsLoaded) {
      updateStore();
    }
  }, [
    transformedOperations,
    userData,
    operationsLoaded,
    setOperations,
    setUserData,
    setUserRole,
    calculateResults,
  ]);

  const sortOperations = (operations: Operation[]) => {
    // Make a copy of the operations array to avoid modifying the original
    let sortedOps = [...operations];

    // Apply value sorting if active
    if (isValueAscending !== null) {
      sortedOps = sortOperationValue(sortedOps, isValueAscending);
    }

    // Apply closing date sorting if active
    if (isClosingDateAscending !== null) {
      sortedOps = sortedOps.sort((a, b) => {
        const aOp = a.fecha_operacion || '';
        const bOp = b.fecha_operacion || '';

        // If both dates are empty, keep their original order
        if (!aOp && !bOp) return 0;
        // If only aOp is empty, it should come last
        if (!aOp) return isClosingDateAscending ? 1 : -1;
        // If only bOp is empty, it should come last
        if (!bOp) return isClosingDateAscending ? -1 : 1;

        // Normal comparison for non-empty dates
        return isClosingDateAscending
          ? aOp.localeCompare(bOp)
          : bOp.localeCompare(aOp);
      });
    }

    // Apply reserva date sorting if active
    if (isReservaDateAscending !== null) {
      sortedOps = sortedOps.sort((a, b) => {
        const aDate = a.fecha_reserva || '';
        const bDate = b.fecha_reserva || '';

        // If both dates are empty, keep their original order
        if (!aDate && !bDate) return 0;
        // If only aDate is empty, it should come last
        if (!aDate) return isReservaDateAscending ? 1 : -1;
        // If only bDate is empty, it should come last
        if (!bDate) return isReservaDateAscending ? -1 : 1;

        // Normal comparison for non-empty dates
        return isReservaDateAscending
          ? aDate.localeCompare(bDate)
          : bDate.localeCompare(aDate);
      });
    }

    // If no sorting is active, default sort by fecha_operacion (descending)
    if (
      isValueAscending === null &&
      isReservaDateAscending === null &&
      isClosingDateAscending === null
    ) {
      sortedOps = sortedOps.sort((a, b) => {
        const aOp = a.fecha_operacion || '';
        const bOp = b.fecha_operacion || '';
        return bOp.localeCompare(aOp);
      });
    }

    return sortedOps;
  };

  const {
    currentOperations,
    allFilteredOperations,
    filteredTotals,
    calculatedHonorarios,
  } = useMemo(() => {
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

    const sortedOps = sortOperations(searchedOps);

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

    // Calcular los honorarios brutos correctamente
    // Utilizamos la función calculateHonorarios de @/common/utils/calculations para cada operación
    const honorariosBrutos = sortedOps.reduce((total, op) => {
      const resultado = calculateHonorarios(
        op.valor_reserva,
        op.porcentaje_honorarios_asesor || 0,
        op.porcentaje_honorarios_broker || 0,
        op.porcentaje_compartido || 0
      );

      return total + resultado.honorariosBroker;
    }, 0);

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
      allFilteredOperations: sortedOps,
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

    return Math.ceil((searchedOps.length || 0) / itemsPerPage);
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
      {/* Header profesional y moderno - VENTAS */}
      <div className="mb-6 border-l-4 border-blue-500 pl-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
                <p className="text-sm text-blue-600 font-medium">
                  Gestión de propiedades
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
              <span className="text-sm font-semibold text-blue-700">
                Ventas
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto flex flex-col justify-around">
        {/* Selector de vista para desktop */}
        <div className="hidden lg:block mb-4">
          <OperationsViewSelector
            currentView={desktopView}
            onViewChange={setDesktopView}
          />
        </div>

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
            operationVentasTypeFilter={operationVentasTypeFilter}
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
            operationVentasTypeFilter={operationVentasTypeFilter}
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
              totalNetFees={calculatedHonorarios.netos}
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
                allFilteredOperations={allFilteredOperations}
                userData={userData as UserData}
                handleEstadoChange={handleEstadoChange}
                handleEditClick={handleEditClick}
                handleDeleteButtonClick={handleDeleteButtonClick}
                handleViewClick={handleViewClick}
                filteredTotals={filteredTotals}
                currencySymbol={currencySymbol}
                totalNetFees={calculatedHonorarios.netos}
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
            userData={userData as UserData}
            currencySymbol={currencySymbol}
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
          secondButtonText="Borrar Operación"
          className="w-[450px]"
          thirdButtonText="Operación Caída"
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
