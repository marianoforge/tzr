import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PencilIcon } from '@heroicons/react/24/outline';

import ProjectionsModal, { WeekData } from './ProjectionsModal';

import { useAuthStore } from '@/stores/authStore';

const generateDefaultWeeks = () => {
  return Array.from({ length: 52 }, (_, index) => ({
    semana: index + 1,
    actividadVerde: '',
    contactosReferidos: '',
    preBuying: '',
    preListing: '',
    captaciones: '',
    reservas: '',
    cierres: '',
  }));
};

const fetchWeeks = async (userId: string) => {
  const response = await fetch(`/api/getWeeks?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch weeks');
  return response.json();
};

const ProjectionsActivity = () => {
  const { userID } = useAuthStore();

  const {
    data: fetchedWeeks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['weeks', userID],
    queryFn: () => fetchWeeks(userID || ''),
  });

  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 18;

  const weeks = generateDefaultWeeks().map((defaultWeek, index) => {
    const existingWeek = fetchedWeeks.find(
      (week: WeekData) => week.semana === index + 1
    );
    return existingWeek || defaultWeek;
  });

  const paginatedWeeks = weeks.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handleEditClick = (index: number) => {
    setSelectedRow(index);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * rowsPerPage < weeks.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) return <p>Cargando...</p>;
  if (error) return <p>Error cargando los datos.</p>;

  return (
    <div className="bg-white p-4 mt-10 rounded-xl shadow-md">
      <table className="min-w-full w-full hidden md:block">
        <thead className="text-center">
          <tr>
            <th className="w-2/12 px-4 py-2">Semana</th>
            <th className="w-2/12 px-4 py-2">Actividad Verde</th>
            <th className="w-2/12 px-4 py-2">Contactos o Referidos</th>
            <th className="w-1/12 px-4 py-2">Pre Buying</th>
            <th className="w-1/12 px-4 py-2">Pre Listing</th>
            <th className="w-1/12 px-4 py-2">Captaciones</th>
            <th className="w-1/12 px-4 py-2">Reservas</th>
            <th className="w-1/12 px-4 py-2">Cierres</th>
            <th className="w-2/12 px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedWeeks.map((week: WeekData, index: number) => (
            <tr key={index} className="text-center bg-white">
              <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                Semana {week.semana}
              </td>
              <td className="w-2/12 px-4 py-4 border-b border-gray-200">
                {week.actividadVerde || 'N/A'}
              </td>
              <td className="w-2/12 px-4 py-4 border-b border-gray-200">
                {week.contactosReferidos || 'N/A'}
              </td>
              <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                {week.preBuying || 'N/A'}
              </td>
              <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                {week.preListing || 'N/A'}
              </td>
              <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                {week.captaciones || 'N/A'}
              </td>
              <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                {week.reservas || 'N/A'}
              </td>
              <td className="w-1/12 px-4 py-4 border-b border-gray-200">
                {week.cierres || 'N/A'}
              </td>
              <td className="w-2/12 px-4 py-4 border-b border-gray-200">
                <button
                  onClick={() => handleEditClick(index)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
        >
          Anterior
        </button>
        <span className="px-4 py-2 mx-1">
          Página {currentPage + 1} de {Math.ceil(weeks.length / rowsPerPage)}
        </span>
        <button
          onClick={handleNextPage}
          disabled={(currentPage + 1) * rowsPerPage >= weeks.length}
          className="px-4 py-2 mx-1 bg-mediumBlue rounded disabled:opacity-50 text-lightPink"
        >
          Siguiente
        </button>
      </div>
      {isModalOpen && selectedRow !== null && (
        <ProjectionsModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          rowData={weeks[selectedRow]}
          rowIndex={selectedRow}
          userID={userID || ''}
        />
      )}
    </div>
  );
};

export default ProjectionsActivity;
