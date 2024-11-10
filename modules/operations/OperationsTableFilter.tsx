// gds-si/modules/operations/OperationsTableFilters.tsx
import React from 'react';
import { Tooltip } from 'react-tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

import Select from '@/components/PrivateComponente/CommonComponents/Select';

interface OperationsTableFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  monthFilter: string;
  setMonthFilter: (month: string) => void;
  operationTypeFilter: string;
  setOperationTypeFilter: (type: string) => void;
  statusOptions: { value: string; label: string }[];
  yearsFilter: { value: string; label: string }[];
  monthsFilter: { value: string; label: string }[];
  operationVentasTypeFilter: { value: string; label: string }[];
}

const OperationsTableFilters: React.FC<OperationsTableFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  yearFilter,
  setYearFilter,
  monthFilter,
  setMonthFilter,
  operationTypeFilter,
  setOperationTypeFilter,
  statusOptions,
  yearsFilter,
  monthsFilter,
  operationVentasTypeFilter,
}) => {
  return (
    <div className="flex items-center mt-2 text-mediumBlue flex-wrap">
      <div className="flex md:w-full lg:w-5/12 lg:justify-around justify-center items-center w-1/2 space-x-4">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Buscardor de operaciones"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[200px] lg:w-[150px] xl:w-[200px] 2xl:w-[250px] h-[40px] p-2 mb-8 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic text-center lg:text-sm xl:text-base"
          />
          <InformationCircleIcon
            className="flex items-center justify-center mb-8  ml-1 text-lightBlue h-6 w-6 cursor-pointer"
            data-tooltip-id="tooltip-vendedora"
            data-tooltip-content="Puedes buscar una operacion por nombre del realizador de la misma o por dirección."
          />
          <Tooltip id="tooltip-vendedora" place="top" />
        </div>
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
  );
};

export default OperationsTableFilters;
