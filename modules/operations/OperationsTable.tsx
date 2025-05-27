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
  const [filteredHonorarios, setFilteredHonorarios] = useState({
    brutos: 0,
    netos: 0,
  });

  const router = useRouter();
  const { userData } = useUserDataStore();
  const { currencySymbol } = useUserCurrencySymbol(userUID || '');
  const {
    setOperations,
    setUserData,
    setUserRole,
    calculateResults,
    calculateResultsByFilters,
  } = useCalculationsStore();

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

  const filterOperations = (operations: Operation[]) => {
    if (statusFilter === OperationStatus.CAIDA) {
      return operations.filter((op) => op.estado === OperationStatus.CAIDA);
    } else if (statusFilter === 'all') {
      // Si el filtro es 'all', excluir operaciones CAIDA
      return operations.filter((op) => op.estado !== OperationStatus.CAIDA);
    } else {
      // Si es otro estado específico (EN_CURSO, CERRADA), mostrar solo ese estado
      return operations.filter((op) => op.estado === statusFilter);
    }
  };

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

      const nonFallenOps = filterOperations(searchedOps);
      const sortedOps = sortOperations(nonFallenOps);

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
      <h2 className="text-2xl font-bold mb-4 text-center">
        Lista de Operaciones - Ventas
      </h2>
      <div className="overflow-x-auto flex flex-col justify-around">
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
