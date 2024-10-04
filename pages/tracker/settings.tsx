import PrivateLayout from "@/components/TrackeComponents/PrivateLayout";
import PrivateRoute from "@/components/TrackeComponents/PrivateRoute";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { cleanString } from "@/utils/cleanString";

const Settings = () => {
  const { userID } = useAuthStore();
  const { userData, fetchUserData, setUserData, error } = useUserDataStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agenciaBroker, setAgenciaBroker] = useState("");
  const [numeroTelefono, setNumeroTelefono] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState({
    firstName: false,
    lastName: false,
    password: false,
    agenciaBroker: false,
    numeroTelefono: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userID) {
      fetchUserData(userID);
    }
  }, [userID, fetchUserData]);

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setAgenciaBroker(userData.agenciaBroker || "");
      setNumeroTelefono(userData.numeroTelefono || "");
    }
  }, [userData]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");

    try {
      await axios.put(`/api/users/${userID}`, {
        userID,
        firstName,
        lastName,
        agenciaBroker: cleanString(agenciaBroker),
        numeroTelefono,
      });

      setSuccess("Información actualizada exitosamente.");
      if (!userData) {
        throw new Error("User data is null");
      }
      setUserData({
        ...userData,
        firstName,
        lastName,
        agenciaBroker,
        numeroTelefono,
        email: userData.email ?? null,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setErrorMessage(
          err.response.data.message || "Error al actualizar usuario"
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Error desconocido al actualizar usuario");
      }
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
          <div className="flex items-center justify-center bg-white">
            <form
              onSubmit={handleUpdate}
              className="bg-white p-6 rounded shadow-md w-[100%]"
            >
              <h2 className="text-2xl mb-4 text-center">Datos Personales</h2>
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
                    className=" bg-blue-500 text-white px-2 h-[40px] rounded hover:bg-blue-600"
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
                    className="bg-blue-500 text-white px-2 h-[40px] rounded hover:bg-blue-600"
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
                    className="bg-blue-500 text-white px-2 h-[40px] rounded hover:bg-blue-600"
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
                    className="bg-blue-500 text-white px-2 h-[40px] rounded hover:bg-blue-600"
                  >
                    {editMode.numeroTelefono ? "Guardar" : "Editar"}
                  </button>
                </div>
              </div>
              <div className="flex items-center w-[80%] justify-end ml-2 mt-6">
                <button
                  type="submit"
                  className="w-[200px] bg-[#7ED994] text-white p-2 rounded hover:bg-[#34D399] font-semibold"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </PrivateLayout>
      </PrivateRoute>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default Settings;
