import PrivateLayout from "@/components/PrivateLayout";
import PrivateRoute from "@/components/PrivateRoute";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";

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

  console.log(userData?.agenciaBroker);
  console.log(userID);

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
      await axios.post("/api/updateUserInfo", {
        userID,
        firstName,
        lastName,
        agenciaBroker,
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
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
              onSubmit={handleUpdate}
              className="bg-white p-6 rounded shadow-md w-11/12 max-w-lg"
            >
              <h2 className="text-2xl mb-4 text-center">Configuración</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {success && <p className="text-green-500 mb-4">{success}</p>}

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
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
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  {editMode.firstName ? "Guardar" : "Editar"}
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
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
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  {editMode.lastName ? "Guardar" : "Editar"}
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Agencia o Broker"
                  value={agenciaBroker}
                  onChange={(e) => setAgenciaBroker(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
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
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  {editMode.agenciaBroker ? "Guardar" : "Editar"}
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="tel"
                  placeholder="Número de Teléfono"
                  value={numeroTelefono}
                  onChange={(e) => setNumeroTelefono(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
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
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  {editMode.numeroTelefono ? "Guardar" : "Editar"}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Actualizar
              </button>
            </form>
          </div>
        </PrivateLayout>
      </PrivateRoute>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default Settings;
