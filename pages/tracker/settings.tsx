import PrivateLayout from "@/components/TrackerComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackerComponents/PrivateRoute";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { cleanString } from "@/utils/cleanString";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatNumber } from "@/utils/formatNumber";

const Settings = () => {
  const { userID } = useAuthStore();
  const queryClient = useQueryClient();
  const { error } = useUserDataStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agenciaBroker, setAgenciaBroker] = useState("");
  const [numeroTelefono, setNumeroTelefono] = useState("");
  const [objetivoAnual, setObjetivoAnual] = useState(0);
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState({
    firstName: false,
    lastName: false,
    password: false,
    agenciaBroker: false,
    numeroTelefono: false,
    objetivoAnual: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: userDataQuery, isLoading: isLoadingQuery } = useQuery({
    queryKey: ["userData", userID],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userID}`);
      return response.data;
    },
    enabled: !!userID,
  });

  useEffect(() => {
    if (userDataQuery) {
      setFirstName(userDataQuery.firstName);
      setLastName(userDataQuery.lastName);
      setAgenciaBroker(userDataQuery.agenciaBroker);
      setNumeroTelefono(userDataQuery.numeroTelefono);
      setObjetivoAnual(
        userDataQuery.objetivoAnual ?? "Objetivo anual no definido"
      );
    }
  }, [userDataQuery]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const response = await axios.put(`/api/users/${userID}`, {
        firstName: cleanString(firstName),
        lastName: cleanString(lastName),
        agenciaBroker: cleanString(agenciaBroker),
        numeroTelefono: cleanString(numeroTelefono),
        objetivoAnual,
      });
      if (response.status === 200) {
        setSuccess("Datos actualizados correctamente");
        queryClient.invalidateQueries({ queryKey: ["userData", userID] });
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      setErrorMessage("Error al actualizar los datos");
    }
  };

  const toggleEditMode = (field: keyof typeof editMode) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = (field: keyof typeof editMode) => {
    toggleEditMode(field);
  };

  return (
    <div>
      <PrivateRoute>
        <PrivateLayout>
          {isLoadingQuery ? (
            <p>Loading...</p>
          ) : (
            <form
              onSubmit={handleUpdate}
              className="bg-white p-6 mt-20 rounded shadow-md w-[100%]"
            >
              <h2 className="text-2xl mb-4 text-center font-semibold">
                Datos Personales
              </h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {success && <p className="text-green-500 mb-4">{success}</p>}
              <div className="flex lg:flex-row flex-col items-center justify-center lg:gap-10 w-full mt-10">
                <div className="mb-4 flex lg:w-[50%] gap-2 lg:justify-end">
                  <input
                    type="text"
                    placeholder="Nombre"
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2 mb-2 border border-gray-300 rounded lg:max-w-[50%]"
                    disabled={!editMode.firstName}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      editMode.firstName
                        ? handleSave("firstName")
                        : toggleEditMode("firstName")
                    }
                    className=" bg-lightBlue text-white px-2 h-[40px] rounded hover:bg-mediumBlue w-[75px]"
                  >
                    {editMode.firstName ? "Guardar" : "Editar"}
                  </button>
                </div>

                <div className="mb-4 flex lg:w-[50%] gap-2 lg:justify-start">
                  <input
                    type="text"
                    placeholder="Apellido"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2 mb-2 border border-gray-300 rounded lg:max-w-[50%]"
                    disabled={!editMode.lastName}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      editMode.lastName
                        ? handleSave("lastName")
                        : toggleEditMode("lastName")
                    }
                    className="bg-lightBlue text-white px-2 h-[40px] rounded hover:bg-mediumBlue w-[75px]"
                  >
                    {editMode.lastName ? "Guardar" : "Editar"}
                  </button>
                </div>
              </div>
              <div className="flex lg:flex-row flex-col items-center justify-center lg:gap-10 w-full">
                <div className="mb-4 flex lg:w-[50%] gap-2 lg:justify-end">
                  <input
                    type="text"
                    placeholder="Agencia o Broker"
                    name="agenciaBroker"
                    value={agenciaBroker}
                    onChange={(e) => setAgenciaBroker(e.target.value)}
                    className="w-full p-2 mb-2 border border-gray-300 rounded lg:max-w-[50%]"
                    disabled={!editMode.agenciaBroker}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      editMode.agenciaBroker
                        ? handleSave("agenciaBroker")
                        : toggleEditMode("agenciaBroker")
                    }
                    className="bg-lightBlue text-white px-2 h-[40px] rounded hover:bg-mediumBlue w-[75px]"
                  >
                    {editMode.agenciaBroker ? "Guardar" : "Editar"}
                  </button>
                </div>

                <div className="mb-4 flex lg:w-[50%] gap-2 lg:justify-start">
                  <input
                    type="tel"
                    placeholder="Número de Teléfono"
                    name="numeroTelefono"
                    value={numeroTelefono}
                    onChange={(e) => setNumeroTelefono(e.target.value)}
                    className="w-full p-2 mb-2 border border-gray-300 rounded lg:max-w-[50%]"
                    disabled={!editMode.numeroTelefono}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      editMode.numeroTelefono
                        ? handleSave("numeroTelefono")
                        : toggleEditMode("numeroTelefono")
                    }
                    className="bg-lightBlue text-white px-2 h-[40px] rounded hover:bg-mediumBlue w-[75px]"
                  >
                    {editMode.numeroTelefono ? "Guardar" : "Editar"}
                  </button>
                </div>
              </div>
              <div className="flex lg:flex-row flex-col w-full">
                <div className="mb-4 flex lg:w-[50%] gap-2 lg:justify-end pr-5">
                  <input
                    type="text"
                    placeholder="Objetivo de Anual de Ventas"
                    name="objetivoAnual"
                    value={`$${formatNumber(objetivoAnual)}`}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setObjetivoAnual(Number(value));
                    }}
                    className="w-full p-2 mb-2 border border-gray-300 rounded lg:max-w-[50%]"
                    disabled={!editMode.objetivoAnual}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      editMode.objetivoAnual
                        ? handleSave("objetivoAnual")
                        : toggleEditMode("objetivoAnual")
                    }
                    className="bg-lightBlue text-white px-2 h-[40px] rounded hover:bg-mediumBlue w-[75px]"
                  >
                    {editMode.objetivoAnual ? "Guardar" : "Editar"}
                  </button>
                </div>
              </div>
              <div className="flex items-center w-[80%] justify-end ml-2 mt-6">
                <button
                  type="submit"
                  className="w-[200px] bg-mediumBlue text-white p-2 rounded hover:bg-lightBlue font-semibold"
                >
                  Actualizar
                </button>
              </div>
            </form>
          )}
        </PrivateLayout>
      </PrivateRoute>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default Settings;
