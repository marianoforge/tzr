import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

import {
  calculateTotalHonorariosBroker,
  totalHonorariosTeamLead,
} from '@/common/utils/calculations';
import { Operation, UserData } from '@/common/types';
import { OperationStatus, UserRole } from '@/common/enums';

// Interface for the state
interface CalculationsState {
  operations: Operation[];
  userData: UserData | null;
  userRole: UserRole | null;
  isLoading: boolean;
  error: string | null;
  results: {
    honorariosBrutos: number;
    honorariosNetos: number;
    honorariosBrutosEnCurso: number;
    honorariosNetosEnCurso: number;
  };
  lastCalculated: number; // timestamp of last calculation

  // Actions
  setOperations: (operations: Operation[]) => void;
  setUserData: (userData: UserData | null) => void;
  setUserRole: (role: UserRole | null) => void;
  fetchOperations: (userID: string) => Promise<void>;
  calculateResults: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Filtros dinámicos
  calculateResultsByFilters: (
    yearFilter: string,
    statusFilter: string
  ) => {
    honorariosBrutos: number;
    honorariosNetos: number;
  };
}

export const useCalculationsStore = create<CalculationsState>()(
  persist(
    (set, get) => ({
      operations: [],
      userData: null,
      userRole: null,
      isLoading: false,
      error: null,
      lastCalculated: 0,
      results: {
        honorariosBrutos: 0,
        honorariosNetos: 0,
        honorariosBrutosEnCurso: 0,
        honorariosNetosEnCurso: 0,
      },

      setOperations: (operations) => {
        // Filtrar para excluir operaciones con estado CAIDA antes de guardarlas
        const operacionesValidas = operations.filter(
          (op) => op.estado !== OperationStatus.CAIDA
        );
        set({ operations: operacionesValidas });
      },

      setUserData: (userData) => set({ userData }),

      setUserRole: (role) => set({ userRole: role }),

      fetchOperations: async (userID) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(
            `/api/operations?user_uid=${userID}`
          );
          const fetchedOperations = response.data;

          // Filtrar para excluir operaciones con estado CAIDA
          const operacionesValidas = fetchedOperations.filter(
            (op: Operation) => op.estado !== OperationStatus.CAIDA
          );

          set({ operations: operacionesValidas });
          get().calculateResults(); // Calculate results after fetching operations
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      calculateResults: () => {
        const { operations, userData, userRole } = get();

        if (operations.length === 0 || !userData || !userRole) {
          // Reset results to 0 when there are no operations
          set({
            results: {
              honorariosBrutos: 0,
              honorariosNetos: 0,
              honorariosBrutosEnCurso: 0,
              honorariosNetosEnCurso: 0,
            },
            lastCalculated: Date.now(),
          });
          return;
        }

        try {
          // Filtrar primero para excluir operaciones CAIDA
          const operacionesValidas = operations.filter(
            (op) => op.estado !== OperationStatus.CAIDA
          );

          // Filter operations for the year 2025 only
          const operations2025 = operacionesValidas.filter((op) => {
            const operationDate = new Date(
              op.fecha_operacion || op.fecha_reserva || ''
            );
            return operationDate.getFullYear() === 2025;
          });

          if (operations2025.length === 0) {
            // Reset results to 0 when there are no 2025 operations
            set({
              results: {
                honorariosBrutos: 0,
                honorariosNetos: 0,
                honorariosBrutosEnCurso: 0,
                honorariosNetosEnCurso: 0,
              },
              lastCalculated: Date.now(),
            });
            return;
          }

          // Filter operations by status for 2025
          const operacionesCerradas = operations2025.filter(
            (op) => op.estado === OperationStatus.CERRADA
          );

          const operacionesEnCurso = operations2025.filter(
            (op) => op.estado === OperationStatus.EN_CURSO
          );

          // Calculate honorarios brutos for closed operations
          const honorariosBrutos =
            calculateTotalHonorariosBroker(operacionesCerradas);

          // Calculate honorarios brutos for operations in progress
          const honorariosBrutosEnCurso =
            calculateTotalHonorariosBroker(operacionesEnCurso);

          // Calculate honorarios netos for each closed operation and sum them
          const honorariosNetos = operacionesCerradas.reduce(
            (total, operation) =>
              total + totalHonorariosTeamLead(operation, userRole, userData),
            0
          );

          // Calculate honorarios netos for each operation in progress and sum them
          const honorariosNetosEnCurso = operacionesEnCurso.reduce(
            (total, operation) =>
              total + totalHonorariosTeamLead(operation, userRole, userData),
            0
          );

          set({
            results: {
              honorariosBrutos,
              honorariosNetos,
              honorariosBrutosEnCurso,
              honorariosNetosEnCurso,
            },
            lastCalculated: Date.now(),
          });
        } catch (error) {
          console.error('Error al calcular resultados:', error);
          set({ error: (error as Error).message });
        }
      },

      calculateResultsByFilters: (yearFilter, statusFilter) => {
        const { operations, userData, userRole } = get();

        if (operations.length === 0 || !userData || !userRole) {
          return { honorariosBrutos: 0, honorariosNetos: 0 };
        }

        try {
          // Convertir el año del filtro a número
          const yearNumber = parseInt(yearFilter);

          // Filtrar operaciones por año
          const filteredByYear = operations.filter((op) => {
            const operationDate = new Date(
              op.fecha_operacion || op.fecha_reserva || ''
            );
            return (
              isNaN(yearNumber) || operationDate.getFullYear() === yearNumber
            );
          });

          // Filtrar por estado
          let filteredByStatus = filteredByYear;
          if (statusFilter !== 'all') {
            filteredByStatus = filteredByYear.filter(
              (op) => op.estado === statusFilter
            );
          } else {
            // Si el filtro es 'all', excluir las operaciones con estado CAIDA
            filteredByStatus = filteredByYear.filter(
              (op) => op.estado !== OperationStatus.CAIDA
            );
          }

          // Calcular honorarios brutos
          const honorariosBrutos =
            calculateTotalHonorariosBroker(filteredByStatus);

          // Calcular honorarios netos
          const honorariosNetos = filteredByStatus.reduce(
            (total, operation) =>
              total + totalHonorariosTeamLead(operation, userRole, userData),
            0
          );

          return {
            honorariosBrutos,
            honorariosNetos,
          };
        } catch (error) {
          console.error('Error al calcular resultados con filtros:', error);
          return { honorariosBrutos: 0, honorariosNetos: 0 };
        }
      },

      setIsLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'calculations-storage', // nombre para guardar en localStorage
      partialize: (state) => ({
        results: state.results,
        lastCalculated: state.lastCalculated,
      }), // solo guardar estos campos
    }
  )
);
