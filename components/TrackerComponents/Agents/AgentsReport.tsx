import React, { useState, useEffect } from "react";
import useUsersWithOperations from "@/hooks/useUserWithOperations";
import Loader from "@/components/TrackerComponents/Loader";
import { UserData, Operation, TeamMember, UserWithOperations } from "@/types";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";
import { formatNumber } from "@/utils/formatNumber";
import { useTeamMembersOps } from "@/hooks/useTeamMembersOps";
import EditAgentsModal from "./EditAgentsModal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const AgentsReport = ({ currentUser }: { currentUser: UserData }) => {
  const { data, loading, error } = useUsersWithOperations(currentUser);
  const teamLeadId = currentUser.uid || "";
  const { members } = useTeamMembersOps(teamLeadId);

  // Estado para almacenar los miembros combinados
  const [combinedData, setCombinedData] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null); // Miembro seleccionado para editar
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal

  // Inicializamos el combinedData solo cuando se cargan data y members
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
        ...(members || []), // Incluye los miembros del equipo si existen
      ];
      setCombinedData(initialData);
    }
  }, [data, members]); // Solo se ejecuta cuando 'data' y 'members' cambian

  // Borrar miembro
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

  // Abrir el modal con los datos del miembro seleccionado
  const handleEditClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true); // Abre el modal con los datos del miembro seleccionado
  };

  // Actualizar miembro
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
        // Actualizar el estado con los nuevos datos
        setCombinedData((prevData) =>
          prevData.map((member) =>
            member.id === updatedMember.id ? updatedMember : member
          )
        );
        console.log("Miembro actualizado correctamente.");
        setIsModalOpen(false); // Cierra el modal después de la actualización exitosa
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

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="bg-white p-4 mt-20 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Informe Asesores</h2>
      {combinedData.length === 0 ? (
        <p className="text-center text-gray-600">No existen agentes</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`bg-lightBlue/10 ${OPERATIONS_LIST_COLORS.headerText}`}
              >
                <th className="py-3 px-4 font-semibold text-start w-1/6">
                  Nombre
                </th>
                <th className="py-3 px-4 font-semibold text-center">Email</th>
                <th className="py-3 px-4 font-semibold text-center w-1/6">
                  Total Facturación Bruta
                </th>
                <th className="py-3 px-4 font-semibold text-center w-1/6">
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
              {combinedData
                .slice()
                .sort((a, b) => {
                  const totalA = a.operaciones.reduce(
                    (acc: number, op: Operation) => acc + op.honorarios_broker,
                    0
                  );
                  const totalB = b.operaciones.reduce(
                    (acc: number, op: Operation) => acc + op.honorarios_broker,
                    0
                  );
                  return totalB - totalA;
                })
                .map((usuario, index) => (
                  <tr
                    key={usuario.id}
                    className={`border-b text-center ${
                      index === 0 ? "bg-green-100" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold w-1/6 text-start">
                      {usuario.firstName} {usuario.lastName}
                      {data.some(
                        (user: UserWithOperations) => user.uid === usuario.id
                      ) && " (yo)"}
                    </td>
                    <td className="py-3 px-4">{usuario.email}</td>
                    <td className="py-3 px-4">
                      {usuario.operaciones.length > 0 ? (
                        <ul>
                          <li>
                            $
                            {formatNumber(
                              usuario.operaciones.reduce(
                                (acc: number, op: Operation) =>
                                  acc + op.honorarios_broker,
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
                          <li>
                            {formatNumber(
                              (usuario.operaciones.reduce(
                                (acc: number, op: Operation) =>
                                  acc + op.honorarios_broker,
                                0
                              ) *
                                100) /
                                honorariosBrokerTotales
                            )}
                            %
                          </li>
                        </ul>
                      ) : (
                        <span>No operations</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {usuario.operaciones.length > 0 ? (
                        <ul>
                          <li>{usuario.operaciones.length}</li>
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
