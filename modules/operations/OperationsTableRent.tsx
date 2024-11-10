import React, { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import OperationsFullScreenTable from './OperationsFullScreenTable';
import OperationsModal from './OperationsModal';
import OperationsTableHeader from './OperationsTableHeader';
import OperationsTableBody from './OperationsTableBody';
import OperationsTableFilters from './OperationsTableFilter';

import {
  fetchUserOperations,
  deleteOperation,
  updateOperation,
} from '@/lib/api/operationsApi';
import { useAuthStore } from '@/stores/authStore';
import { Operation, UserData } from '@/common/types/';
import { useUserDataStore } from '@/stores/userDataStore';
import { calculateTotals } from '@/common/utils/calculations';
import { filteredOperations } from '@/common/utils/filteredOperations';
import { filterOperationsBySearch } from '@/common/utils/filterOperationsBySearch';
import { sortOperationValue } from '@/common/utils/sortUtils';
import ModalDelete from '@/components/PrivateComponente/CommonComponents/Modal';
import {
  monthsFilter,
  operationVentasTypeFilter,
  statusOptions,
  yearsFilter,
} from '@/lib/data';
import { ALQUILER, OperationStatus, QueryKeys } from '@/common/enums';

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
        operation.tipo_operacion.startsWith(ALQUILER.ALQUILER)
      );
  }, [operations]);

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
        <OperationsTableFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
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
            isDateAscending={isDateAscending}
            isValueAscending={isValueAscending}
            toggleDateSortOrder={toggleDateSortOrder}
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
