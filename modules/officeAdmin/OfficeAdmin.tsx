import React from 'react';

import { useGetOfficesData } from '@/common/hooks/useGetOfficesData';
import { Operation } from '@/common/types';
import { formatOperationsNumber } from '@/common/utils/formatNumber';
import { calculateHonorarios } from '@/common/utils/calculations';

interface OperationSummary {
  tipo: string;
  totalValue: number;
  averagePuntas: number;
  totalGrossFees: number;
  totalNetFees: number;
  exclusivityPercentage: number;
  operationsCount: number;
}

// Interfaz para resumenes globales
interface GlobalSummary {
  totalValue: number;
  totalGrossFees: number;
  totalNetFees: number;
  totalOperations: number;
  officeCount: number;
}

const OfficeAdmin = () => {
  const { officeOperations, officeData, isLoading, error, refetch } =
    useGetOfficesData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error.message}</span>
        <button
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => refetch()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Agrupamos operaciones por oficina (teamId)
  const officeGroups = officeOperations.reduce(
    (groups: Record<string, Operation[]>, operation: Operation) => {
      const teamId = operation.teamId || 'Sin Equipo';
      if (!groups[teamId]) {
        groups[teamId] = [];
      }
      groups[teamId].push(operation);
      return groups;
    },
    {} as Record<string, Operation[]>
  );

  // Función para obtener el nombre de la oficina a partir del teamId
  const getOfficeName = (teamId: string) => {
    return officeData[teamId]?.office || teamId;
  };

  // Función para calcular el resumen de operaciones por tipo
  const getOperationsSummaryByType = (
    operations: Operation[]
  ): OperationSummary[] => {
    // Agrupar operaciones por tipo
    const operationTypes = Array.from(
      new Set(
        operations
          .map((op) => op.tipo_operacion)
          .filter((tipo): tipo is string => Boolean(tipo))
      )
    );

    return operationTypes
      .map((tipo) => {
        const opsOfType = operations.filter((op) => op.tipo_operacion === tipo);

        if (opsOfType.length === 0) return null;

        // Calcular totales
        const totalValue = opsOfType.reduce(
          (sum, op) => sum + (op.valor_reserva || 0),
          0
        );

        // Calcular promedio de puntas
        const totalPuntas = opsOfType.reduce(
          (sum, op) =>
            sum +
            ((op.porcentaje_punta_compradora || 0) +
              (op.porcentaje_punta_vendedora || 0)),
          0
        );
        const averagePuntas =
          opsOfType.length > 0 ? totalPuntas / opsOfType.length : 0;

        // Calcular honorarios brutos
        const totalGrossFees = opsOfType.reduce((sum, op) => {
          const honorarios = calculateHonorarios(
            op.valor_reserva || 0,
            op.porcentaje_honorarios_asesor || 0,
            op.porcentaje_honorarios_broker || 0,
            op.porcentaje_compartido || 0,
            op.porcentaje_referido || 0
          ).honorariosBroker;
          return sum + honorarios;
        }, 0);

        // Calcular honorarios netos (asumiendo que son los honorarios de asesor)
        const totalNetFees = opsOfType.reduce(
          (sum, op) => sum + (op.honorarios_asesor || 0),
          0
        );

        // Calcular porcentaje de exclusividad
        const exclusiveOps = opsOfType.filter((op) => op.exclusiva === true);
        const exclusivityPercentage =
          opsOfType.length > 0
            ? (exclusiveOps.length / opsOfType.length) * 100
            : 0;

        return {
          tipo,
          totalValue,
          averagePuntas,
          totalGrossFees,
          totalNetFees,
          exclusivityPercentage,
          operationsCount: opsOfType.length,
        };
      })
      .filter((summary): summary is OperationSummary => summary !== null);
  };

  // Calcular el resumen global de todas las oficinas
  const calculateGlobalSummary = (): GlobalSummary => {
    const totalValue = officeOperations.reduce(
      (sum, op) => sum + (op.valor_reserva || 0),
      0
    );

    const totalGrossFees = officeOperations.reduce((sum, op) => {
      const honorarios = calculateHonorarios(
        op.valor_reserva || 0,
        op.porcentaje_honorarios_asesor || 0,
        op.porcentaje_honorarios_broker || 0,
        op.porcentaje_compartido || 0,
        op.porcentaje_referido || 0
      ).honorariosBroker;
      return sum + honorarios;
    }, 0);

    const totalNetFees = officeOperations.reduce(
      (sum, op) => sum + (op.honorarios_asesor || 0),
      0
    );

    return {
      totalValue,
      totalGrossFees,
      totalNetFees,
      totalOperations: officeOperations.length,
      officeCount: Object.keys(officeGroups).length,
    };
  };

  const globalSummary = calculateGlobalSummary();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Administración de Oficinas</h1>

      {/* Resumen Global */}
      <div className="bg-blue-100 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold text-blue-800 mb-4">Resumen Global</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Valor Total</p>
            <p className="text-2xl font-bold">
              ${formatOperationsNumber(globalSummary.totalValue)}
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Honorarios Brutos</p>
            <p className="text-2xl font-bold">
              ${formatOperationsNumber(globalSummary.totalGrossFees)}
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Honorarios Netos</p>
            <p className="text-2xl font-bold">
              ${formatOperationsNumber(globalSummary.totalNetFees)}
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Total Operaciones</p>
            <p className="text-2xl font-bold">
              {globalSummary.totalOperations}
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Oficinas</p>
            <p className="text-2xl font-bold">{globalSummary.officeCount}</p>
          </div>
        </div>
      </div>

      {officeOperations.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No se encontraron operaciones para las oficinas.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(officeGroups).map(([teamId, operations]) => {
            // Type assertion for operations
            const typedOperations = operations as Operation[];
            // Obtener resumen por tipo de operación
            const operationsSummaries =
              getOperationsSummaryByType(typedOperations);

            return (
              <div
                key={teamId}
                className="border rounded-lg overflow-hidden shadow"
              >
                <div className="bg-gray-100 p-4 border-b">
                  <h2 className="text-xl font-semibold">
                    Oficina: {getOfficeName(teamId)}
                  </h2>
                  <div className="text-sm text-gray-600">
                    {typedOperations.length} operaciones encontradas
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 border-b text-left">
                          Tipo de Operación
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          Valor Total
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          Promedio % Puntas
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          Honorarios Brutos
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          Honorarios Netos
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          % Exclusividad
                        </th>
                        <th className="py-3 px-4 border-b text-center">
                          Cantidad
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {operationsSummaries.map((summary) => (
                        <tr key={summary.tipo} className="hover:bg-gray-50">
                          <td className="py-3 px-4 border-b font-medium">
                            {summary.tipo}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            ${formatOperationsNumber(summary.totalValue)}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            {formatOperationsNumber(
                              summary.averagePuntas,
                              true
                            )}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            ${formatOperationsNumber(summary.totalGrossFees)}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            ${formatOperationsNumber(summary.totalNetFees)}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            {formatOperationsNumber(
                              summary.exclusivityPercentage,
                              true
                            )}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            {summary.operationsCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OfficeAdmin;
