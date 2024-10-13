import React from "react";
import useUsersWithOperations from "@/hooks/useUserWithOperations";
import Loader from "@/components/TrackerComponents/Loader";
import { UserData } from "@/types";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";
import { formatNumber } from "@/utils/formatNumber";

const AgentsReport = ({ currentUser }: { currentUser: UserData }) => {
  const { data, loading, error } = useUsersWithOperations(currentUser);

  const honorariosBrokerTotales = data.reduce((acc, usuario) => {
    return (
      acc +
      usuario.operaciones.reduce((sum, op) => sum + op.honorarios_broker, 0)
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
      {data.length === 0 ? (
        <p className="text-center text-gray-600">No existen agentes</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`${OPERATIONS_LIST_COLORS.headerBg} ${OPERATIONS_LIST_COLORS.headerText} `}
              >
                <th className="py-3 px-4 font-semibold text-center">Name</th>
                <th className="py-3 px-4 font-semibold text-center">Email</th>
                <th className="py-3 px-4 font-semibold text-center">
                  Total Facturacion Bruta
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Aporte a la Facturacion Bruta
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
              {data
                .slice()
                .sort((a, b) => {
                  const totalA = a.operaciones.reduce(
                    (acc, op) => acc + op.honorarios_broker,
                    0
                  );
                  const totalB = b.operaciones.reduce(
                    (acc, op) => acc + op.honorarios_broker,
                    0
                  );
                  return totalB - totalA;
                })
                .map((usuario, index) => (
                  <tr
                    key={usuario.uid}
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
                              (acc, op) => acc + op.honorarios_broker,
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
                              (acc, op) => acc + (op.punta_compradora ? 1 : 0),
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
                              (acc, op) => acc + (op.punta_vendedora ? 1 : 0),
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
                              (acc, op) =>
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
                              (acc, op) => acc + op.valor_reserva,
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
