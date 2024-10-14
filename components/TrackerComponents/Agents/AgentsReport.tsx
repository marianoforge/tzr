import React from "react";
import useUsersWithOperations from "@/hooks/useUserWithOperations";
import Loader from "@/components/TrackerComponents/Loader";
import { UserData, Operation, TeamMember, UserWithOperations } from "@/types";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";
import { formatNumber } from "@/utils/formatNumber";
import { useTeamMembersOps } from "@/hooks/useTeamMembersOps";

// El tipo del componente debe incluir los props, en este caso el currentUser de tipo UserData.
const AgentsReport = ({ currentUser }: { currentUser: UserData }) => {
  const { data, loading, error } = useUsersWithOperations(currentUser);
  const teamLeadId = currentUser.uid || "";
  const { members } = useTeamMembersOps(teamLeadId);

  const combinedData: TeamMember[] = [
    ...data.map((user: UserWithOperations) => ({
      id: user.uid, // Asigna el uid a id
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      numeroTelefono: "",
      operaciones: user.operaciones,
    })),
    ...(members || []), // Incluye los miembros del equipo si existen
  ];

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
      <h2 className="text-2xl font-bold mb-4 text-center">Lista de Agentes</h2>
      {combinedData.length === 0 ? (
        <p className="text-center text-gray-600">No existen agentes</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`${OPERATIONS_LIST_COLORS.headerBg} ${OPERATIONS_LIST_COLORS.headerText}`}
              >
                <th className="py-3 px-4 font-semibold text-center">Name</th>
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
                    className={`border-b transition duration-150 ease-in-out text-center ${
                      index === 0 ? "bg-greenAccent/10" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text">
                      {usuario.firstName} {usuario.lastName}
                    </td>

                    <td className="py-3 px-4">{usuario.email}</td>
                    <td className="py-3 px-4">
                      {usuario.operaciones.length > 0 ? (
                        <ul>
                          <li>
                            {usuario.operaciones.reduce(
                              (acc: number, op: Operation) =>
                                acc + op.honorarios_broker,
                              0
                            )}
                          </li>
                        </ul>
                      ) : (
                        <span>No operations</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
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
                      {usuario.operaciones.length > 0 ? (
                        <ul>
                          <li>
                            {usuario.operaciones.reduce(
                              (acc: number, op: Operation) =>
                                acc + (op.punta_compradora ? 1 : 0),
                              0
                            )}
                          </li>
                        </ul>
                      ) : (
                        <span>No operations</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {usuario.operaciones.length > 0 ? (
                        <ul>
                          <li>
                            {usuario.operaciones.reduce(
                              (acc: number, op: Operation) =>
                                acc + (op.punta_vendedora ? 1 : 0),
                              0
                            )}
                          </li>
                        </ul>
                      ) : (
                        <span>No operations</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {usuario.operaciones.length > 0 ? (
                        <ul>
                          <li>
                            {usuario.operaciones.reduce(
                              (acc: number, op: Operation) =>
                                acc +
                                (op.punta_compradora ? 1 : 0) +
                                (op.punta_vendedora ? 1 : 0),
                              0
                            )}
                          </li>
                        </ul>
                      ) : (
                        <span>No operations</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {usuario.operaciones.length > 0 ? (
                        <ul>
                          <li>
                            {usuario.operaciones.reduce(
                              (acc: number, op: Operation) =>
                                acc + op.valor_reserva,
                              0
                            )}
                          </li>
                        </ul>
                      ) : (
                        <span>No operations</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentsReport;
