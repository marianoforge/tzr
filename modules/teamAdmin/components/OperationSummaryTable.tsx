import React from 'react';

import { formatOperationsNumber } from '@/common/utils/formatNumber';

import { OperationSummaryTableProps } from '../types';

const OperationSummaryTable: React.FC<OperationSummaryTableProps> = ({
  operationsSummaries,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-[#00b6d6]/10">
          <tr>
            <th className="py-3 px-4 border-b text-left">Tipo de Operación</th>
            <th className="py-3 px-4 border-b text-center">Valor Total</th>
            <th className="py-3 px-4 border-b text-center">
              Promedio % Puntas
            </th>
            <th className="py-3 px-4 border-b text-center">
              Honorarios Brutos
            </th>
            <th className="py-3 px-4 border-b text-center">Honorarios Netos</th>
            <th className="py-3 px-4 border-b text-center">% Exclusividad</th>
            <th className="py-3 px-4 border-b text-center">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {operationsSummaries.map((summary) => (
            <tr key={summary.tipo} className="hover:bg-gray-50">
              <td className="py-3 px-4 border-b font-medium">{summary.tipo}</td>
              <td className="py-3 px-4 border-b text-center">
                ${formatOperationsNumber(summary.totalValue)}
              </td>
              <td className="py-3 px-4 border-b text-center">
                {formatOperationsNumber(summary.averagePuntas, true)}
              </td>
              <td className="py-3 px-4 border-b text-center">
                ${formatOperationsNumber(summary.totalGrossFees)}
              </td>
              <td className="py-3 px-4 border-b text-center">
                ${formatOperationsNumber(summary.totalNetFees)}
              </td>
              <td className="py-3 px-4 border-b text-center">
                {formatOperationsNumber(summary.exclusivityPercentage, true)}
              </td>
              <td className="py-3 px-4 border-b text-center">
                {summary.operationsCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OperationSummaryTable;
