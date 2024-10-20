import React, { useEffect, useState } from "react";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useUsersWithOperations from "@/hooks/useUserWithOperations";
import Loader from "../Loader";
import { TeamMember, UserData, UserWithOperations } from "@/types";
import { formatNumber } from "@/utils/formatNumber";
import { useTeamMembersOps } from "@/hooks/useTeamMembersOps";
import EditAgentsModal from "./EditAgentsModal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const AgentsReportCarousel = ({ currentUser }: { currentUser: UserData }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };
  const { data, loading, error } = useUsersWithOperations(currentUser);
  const teamLeadId = currentUser.uid || "";
  const { members } = useTeamMembersOps(teamLeadId);
  const [combinedData, setCombinedData] = useState<TeamMember[]>([]);

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const honorariosBrokerTotales = combinedData.reduce((acc, usuario) => {
    return (
      acc +
      usuario.operaciones.reduce((sum, op) => sum + op.honorarios_broker, 0)
    );
  }, 0);

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
        // Update the combinedData with the new data
        setCombinedData((prevData) =>
          prevData.map((member) =>
            member.id === updatedMember.id ? updatedMember : member
          )
        );
        console.log("Member updated successfully.");
        setIsModalOpen(false);
      } else {
        console.error("Error updating member:", await response.text());
      }
    } catch (error) {
      console.error("Error in PUT request:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <Slider {...settings}>
        {combinedData.map((usuario) => (
          <div key={usuario.id} className="p-4 expense-card">
            <div className="bg-mediumBlue text-lightPink p-4 rounded-xl shadow-md flex justify-center space-x-4 h-auto min-h-[300px]">
              <div className="space-y-2 sm:space-y-4 flex flex-col w-[100%]">
                <p>
                  <strong>Nombre:</strong> {usuario.firstName}{" "}
                  {usuario.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {usuario.email}
                </p>
                <p>
                  <strong>Total Facturacion Bruta:</strong>{" "}
                  {usuario.operaciones.length > 0 ? (
                    `$${usuario.operaciones.reduce(
                      (acc, op) => acc + op.honorarios_asesor,
                      0
                    )}`
                  ) : (
                    <span>No operations</span>
                  )}
                </p>
                <p>
                  <strong>Aporte a la Facturación Bruta</strong>{" "}
                  {usuario.operaciones.length > 0 ? (
                    <ul>
                      <li>
                        {formatNumber(
                          (usuario.operaciones.reduce(
                            (acc, op) => acc + op.honorarios_broker,
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
                </p>
                <p>
                  <strong>Cantidad de Operaciones:</strong>{" "}
                  {usuario.operaciones.length > 0 ? (
                    usuario.operaciones.length
                  ) : (
                    <span>No operations</span>
                  )}
                </p>
                <p>
                  <strong>Puntas Compradoras:</strong>{" "}
                  {usuario.operaciones.reduce(
                    (acc, op) => acc + (op.punta_compradora ? 1 : 0),
                    0
                  )}
                </p>
                <p>
                  <strong>Puntas Vendedoras:</strong>{" "}
                  {usuario.operaciones.reduce(
                    (acc, op) => acc + (op.punta_vendedora ? 1 : 0),
                    0
                  )}
                </p>
                <p>
                  <strong>Puntas totales:</strong>{" "}
                  {usuario.operaciones.reduce(
                    (acc, op) =>
                      acc +
                      (op.punta_compradora ? 1 : 0) +
                      (op.punta_vendedora ? 1 : 0),
                    0
                  )}
                </p>
                {data.some(
                  (user: UserWithOperations) => user.uid === usuario.id
                ) ? null : (
                  <div className="flex w-full justify-center gap-8">
                    <button
                      onClick={() => handleEditClick(usuario)}
                      className="text-lightPink hover:text-lightGreen transition duration-150 ease-in-out text-sm font-semibold "
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(usuario.id)}
                      className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                    >
                      <TrashIcon className="text-redAccent h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {isModalOpen && selectedMember && (
        <EditAgentsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          member={selectedMember}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default AgentsReportCarousel;
