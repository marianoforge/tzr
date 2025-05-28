import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { useAuthStore } from '@/stores/authStore';
import { TeamMember } from '@/common/types';
import { QueryKeys } from '@/common/enums';
import usePagination from '@/common/hooks/usePagination';

const AgentsLists = ({ userId }: { userId: string }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAgents = async () => {
    const token = await useAuthStore.getState().getAuthToken();
    if (!token) throw new Error('User not authenticated');

    const response = await fetch('/api/users/teamMembers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return data.teamMembers;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: [QueryKeys.TEAM_MEMBERS],
    queryFn: fetchAgents,
  });

  const filteredAgents =
    data?.filter((agent: TeamMember) => {
      if (agent.teamLeadID !== userId) return false;

      // Si no hay búsqueda, mostrar todos los agentes del team leader
      if (!searchQuery.trim()) return true;

      // Normalizar todo a minúsculas y eliminar espacios extra
      const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
      const email = (agent.email || '').toLowerCase();
      const phone = (agent.numeroTelefono || '').toLowerCase();

      // Normalizar la búsqueda
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const searchWords = normalizedQuery
        .split(/\s+/)
        .filter((word) => word.length > 0);

      // Buscar en todos los campos relevantes
      return searchWords.every(
        (word) =>
          fullName.includes(word) ||
          email.includes(word) ||
          phone.includes(word)
      );
    }) || [];

  const {
    currentItems: paginatedAgents,
    currentPage,
    totalPages,
    handlePageChange,
    disablePagination,
  } = usePagination<TeamMember>(filteredAgents, 5); // Show 5 items per page

  if (isLoading) {
    return <SkeletonLoader height={60} count={14} />;
  }

  if (error) {
    return <p>Error: {error?.message || 'An unknown error occurred'}</p>;
  }

  return (
    <div className="bg-white p-4 mt-4 mb-20 rounded-xl shadow-md w-full">
      <div className="flex items-center mb-4 w-full">
        <h2 className="text-2xl font-bold text-center w-full">
          Lista de Asesores
        </h2>
      </div>
      <div className="flex items-center justify-center mb-4">
        <input
          type="text"
          placeholder="Buscar asesor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[460px] p-2 border border-gray-300 rounded font-semibold mr-4 placeholder-mediumBlue placeholder-italic text-center"
        />
      </div>

      {filteredAgents.length === 0 ? (
        <p className="text-center">No hay asesores para mostrar</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-lightBlue/10">
                <th className="py-3 px-4 font-semibold">Nombre</th>
                <th className="py-3 px-4 font-semibold">Apellido</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAgents.map((agent: TeamMember, index: number) => (
                <tr key={index} className="border-b text-center h-[75px]">
                  <td className="py-3 px-4 text-start">{agent.firstName}</td>
                  <td className="py-3 px-4 text-start">{agent.lastName}</td>
                  <td className="py-3 px-4 text-start">{agent.email}</td>
                  <td className="py-3 px-4 text-start">
                    {agent.numeroTelefono}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!disablePagination && (
        <div className="flex justify-center mt-4">
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
      )}
    </div>
  );
};

export default AgentsLists;
