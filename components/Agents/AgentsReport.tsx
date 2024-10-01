import React from "react";
import useUsersWithOperations from "@/hooks/useUserWithOperations";

const AgentsReport = ({ currentUser }: { currentUser: any }) => {
  // Llamamos al hook con el usuario actual
  const { data, loading, error } = useUsersWithOperations(currentUser);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Agencia Broker</th>
          <th>Operaciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((usuario) => (
          <tr key={usuario.uid}>
            <td>{usuario.name}</td>
            <td>{usuario.email}</td>
            <td>{usuario.agenciaBroker}</td>
            <td>
              {usuario.operaciones.length > 0 ? (
                <ul>
                  <li>
                    <strong>Total: </strong>
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
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AgentsReport;
