import React, { useState, useEffect } from "react";
import useUsersWithOperations from "@/hooks/useUserWithOperations";
import Loader from "@/components/TrackerComponents/Loader";
import { UserData, Operation, TeamMember, UserWithOperations } from "@/types";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";
import { formatNumber } from "@/utils/formatNumber";
import { useTeamMembersOps } from "@/hooks/useTeamMembersOps";
import EditAgentsModal from "./EditAgentsModal";
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import AddUserModal from "../Agents/AddUserModal"; // Importa el modal

const AgentsReport = ({ currentUser }: { currentUser: UserData }) => {
  const { data, loading, error } = useUsersWithOperations(currentUser);
  const teamLeadId = currentUser.uid || "";
  const { members } = useTeamMembersOps(teamLeadId);

  // Estado para almacenar los miembros combinados
  const [combinedData, setCombinedData] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const handleAddAdvisorClick = () => {
    setIsAddUserModalOpen(true);
  };

  useEffect(() => {
    if (data && members) {
      const initialData: TeamMember[] = [
        ...data.map((user: UserWithOperations) => ({
          id: user.uid,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          numeroTelefono: "",
          operaciones: user.operaciones,
        })),
        ...(members || []),
      ];
      setCombinedData(initialData);
    }
  }, [data, members]);

  const handleDeleteClick = async (memberId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este miembro?")) {
      try {
        const response = await fetch(`/api/teamMembers/${memberId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          // Actualizar el estado eliminando el miembro
          setCombinedData((prevData) =>
            prevData.filter((member) => member.id !== memberId)
          );
          console.log(`Miembro con ID ${memberId} borrado.`);
        } else {
          console.error("Error al borrar el miembro:", await response.text());
        }
      } catch (error) {
        console.error("Error en la petición DELETE:", error);
      }
    }
  };

  const handleEditClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleSubmit = async (updatedMember: TeamMember) => {
    try {
      const response = await fetch(`/api/teamMembers/${updatedMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: updatedMember.firstName,
          lastName: updatedMember.lastName,
          email: updatedMember.email,
        }),
      });

      if (response.ok) {
        setCombinedData((prevData) =>
          prevData.map((member) =>
            member.id === updatedMember.id ? updatedMember : member
          )
        );
        console.log("Miembro actualizado correctamente.");
        setIsModalOpen(false);
      } else {
        console.error("Error al actualizar el miembro:", await response.text());
      }
    } catch (error) {
      console.error("Error en la petición PUT:", error);
    }
  };

  const honorariosBrokerTotales = combinedData.reduce((acc, usuario) => {
    return (
      acc +
      usuario.operaciones.reduce(
        (sum: number, op: { honorarios_broker: number }) =>
          sum + op.honorarios_broker,
        0
      )
    );
  }, 0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate the percentage of honorarios_broker for each agent
  const sortedData = combinedData
    .map((agent) => ({
      ...agent,
      percentage:
        agent.operaciones.reduce(
          (acc: number, op: Operation) => acc + op.honorarios_broker,
          0
        ) / honorariosBrokerTotales,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Calculate indices for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAgents = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="bg-white p-4 mt-20 mb-20 rounded-xl shadow-md">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-end w-7/12 justify-end mb-4">
          Informe Asesores
        </h2>
        <button
          onClick={handleAddAdvisorClick}
          className="flex items-center hover:text-mediumBlue w-5/12 justify-end mr-2 mb-3"
        >
          <UserPlusIcon className="w-5 h-5 mr-2 text-lightBlue" />
          Agregar Asesor
        </button>
      </div>
      {currentAgents.length === 0 ? (
        <p className="text-center text-gray-600">No existen agentes</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`bg-lightBlue/10 ${OPERATIONS_LIST_COLORS.headerText}`}
              >
                <th className="py-3 px-4 font-semibold text-start">
                  Nombre y Apellido
                </th>
                <th className="py-3 px-4 font-semibold text-center">Email</th>
                <th className="py-3 px-4 font-semibold text-center">
                  Total Facturación Bruta
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Aporte a la Facturación Bruta
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Cantidad de Operaciones
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Puntas Compradoras
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Puntas Vendedoras
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Puntas Totales
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Monto Total Operaciones
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {currentAgents.map((usuario, index) => (
                <tr
                  key={usuario.id}
                  className={`border-b text-center h-[75px]  ${
                    currentPage === 1 && index === 0 ? "bg-green-100" : ""
                  }`}
                >
                  <td className=" font-semibold text-start w-full">
                    {usuario.firstName} {usuario.lastName}
                    {data.some(
                      (user: UserWithOperations) => user.uid === usuario.id
                    ) && " (yo)"}
                  </td>
                  <td className="py-3 px-4 text-sm">{usuario.email}</td>
                  <td className="py-3 px-4">
                    {usuario.operaciones.length > 0 ? (
                      <ul>
                        <li>
                          $
                          {formatNumber(
                            usuario.operaciones.reduce(
                              (acc: number, op: Operation) => {
                                const isHalfOperation =
                                  op.user_uid &&
                                  op.user_uid_adicional &&
                                  op.user_uid !== op.user_uid_adicional;
                                return (
                                  acc +
                                  op.honorarios_broker *
                                    (isHalfOperation ? 0.5 : 1)
                                );
                              },
                              0
                            )
                          )}
                        </li>
                      </ul>
                    ) : (
                      <span>No operations</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {usuario.operaciones.length > 0 ? (
                      <ul>
                        <li>{formatNumber(usuario.percentage * 100)}%</li>
                      </ul>
                    ) : (
                      <span>No operations</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {usuario.operaciones.length > 0 ? (
                      <ul>
                        <li>
                          {usuario.operaciones.reduce((total, op) => {
                            const isHalfOperation =
                              op.user_uid &&
                              op.user_uid_adicional &&
                              op.user_uid !== op.user_uid_adicional;
                            const isSingleOperation =
                              op.user_uid && !op.user_uid_adicional;
                            return (
                              total +
                              (isHalfOperation ? 0.5 : 0) +
                              (isSingleOperation ? 1 : 0)
                            );
                          }, 0)}
                        </li>
                      </ul>
                    ) : (
                      <span>No operations</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {usuario.operaciones.reduce(
                      (acc, op) => acc + (op.punta_compradora ? 1 : 0),
                      0
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {usuario.operaciones.reduce(
                      (acc, op) => acc + (op.punta_vendedora ? 1 : 0),
                      0
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {usuario.operaciones.reduce(
                      (acc, op) =>
                        acc +
                        (op.punta_compradora ? 1 : 0) +
                        (op.punta_vendedora ? 1 : 0),
                      0
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {formatNumber(
                      usuario.operaciones.reduce(
                        (acc, op) => acc + op.valor_reserva,
                        0
                      )
                    )}
                  </td>
                  {/* Columna de acciones */}
                  <td className="py-3 px-4">
                    {data.some(
                      (user: UserWithOperations) => user.uid === usuario.id
                    ) ? null : (
                      <>
                        <button
                          onClick={() => handleEditClick(usuario)}
                          className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(usuario.id)}
                          className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold ml-4"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
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

      {/* Modal para agregar asesor */}
      {isAddUserModalOpen && (
        <AddUserModal onClose={() => setIsAddUserModalOpen(false)} />
      )}

      {/* Modal para editar */}
      {isModalOpen && selectedMember && (
        <EditAgentsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          member={selectedMember}
          onSubmit={handleSubmit} // Pasa handleSubmit al modal
        />
      )}
    </div>
  );
};

export default AgentsReport;
