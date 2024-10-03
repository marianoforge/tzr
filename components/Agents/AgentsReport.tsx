import React from "react";
import useUsersWithOperations from "@/hooks/useUserWithOperations";
import Loader from "../Loader"; // Asegúrate de importar el Loader si no está ya importado
import { UserData } from "@/types";

const AgentsReport = ({ currentUser }: { currentUser: UserData }) => {
  const { data, loading, error } = useUsersWithOperations(currentUser);

  if (loading) {
    return <Loader />; // Usar el componente Loader
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="bg-white p-6 mt-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Lista de Agentes</h2>
      {data.length === 0 ? (
        <p className="text-center text-gray-600">No existen agentes</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 font-semibold text-center">Name</th>
                <th className="py-3 px-4 font-semibold text-center">Email</th>

                <th className="py-3 px-4 font-semibold text-center">
                  Total Facturacion Bruta
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
                  Monto Total Operaciones
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((usuario) => (
                <tr
                  key={usuario.uid}
                  className="border-b transition duration-150 ease-in-out text-center"
                >
                  <td className="py-3 px-4">
                    {usuario.firstName} {usuario.lastName}
                  </td>
                  <td className="py-3 px-4">{usuario.email}</td>

                  <td className="py-3 px-4">
                    {usuario.operaciones.length > 0 ? (
                      <ul>
                        <li>
                          {usuario.operaciones.reduce(
                            (acc, op) => acc + op.honorarios_asesor,
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
