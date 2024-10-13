import React, { useEffect, useState } from "react";

import { createSchema } from "@/schemas/registerFormSchema";
import { RegisterData } from "@/types";
import { cleanString } from "@/utils/cleanString";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import Button from "./FormComponents/Button";
import Input from "./FormComponents/Input";
import ModalOK from "./ModalOK";

interface AddUserModalProps {
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose }) => {
  const router = useRouter();
  const { googleUser, email, uid } = router.query; // Capturar uid desde la query (si es usuario de Google)
  const [csrfToken, setCsrfToken] = useState<string | null>(null); // State to store the CSRF token

  // Use the createSchema function to define the schema
  const schema = createSchema(googleUser === "true");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue, // Para setear el email automáticamente
  } = useForm<RegisterData>({
    resolver: yupResolver(schema) as Resolver<RegisterData>,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [formError, setFormError] = useState("");

  // Fetch the CSRF token when the component mounts
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch("/api/auth/register"); // Endpoint to get the CSRF token
        const data = await res.json();
        setCsrfToken(data.csrfToken); // Store the token in the state
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };

    fetchCsrfToken();
  }, []);

  // Setear el email automáticamente si el usuario viene de Google
  useEffect(() => {
    if (googleUser === "true" && email) {
      setValue("email", email as string);
    }
  }, [googleUser, email, setValue]);

  const onSubmit: SubmitHandler<RegisterData> = async (data) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken || "",
        },
        body: JSON.stringify({
          ...data,
          agenciaBroker: cleanString(data.agenciaBroker),
          googleUser: googleUser === "true",
          uid: googleUser === "true" ? uid : undefined,
          password: googleUser !== "true" ? data.password : undefined,
          confirmPassword:
            googleUser !== "true" ? data.confirmPassword : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar usuario");
      }

      setModalMessage("Se ha agregado un nuevo asesor.");
      setIsModalOpen(true);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unknown error occurred");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 pt-4 rounded-xl shadow-lg text-center font-bold w-auto  h-auto max-h-[90vh] overflow-y-auto flex flex-col justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 pt-4 w-11/12 max-w-lg rounded-lg"
        >
          <h2 className="text-2xl mb-6 text-center">Agregar Asesor</h2>
          {formError && <p className="text-red-500 mb-4">{formError}</p>}

          <Input
            type="text"
            placeholder="Nombre"
            {...register("firstName")}
            required
          />
          {errors.firstName && (
            <p className="text-red-500">{errors.firstName.message}</p>
          )}

          <Input
            type="text"
            placeholder="Apellido"
            {...register("lastName")}
            required
          />
          {errors.lastName && (
            <p className="text-red-500">{errors.lastName.message}</p>
          )}

          <Input
            type="email"
            placeholder="Correo electrónico"
            {...register("email")}
            required
            readOnly={googleUser === "true"} // Si viene de Google, no puede modificar el email
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}

          {googleUser !== "true" && (
            <>
              <Input
                type="password"
                placeholder="Contraseña"
                {...register("password")}
                required
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}

              <Input
                type="password"
                placeholder="Repite la contraseña"
                {...register("confirmPassword")}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500">{errors.confirmPassword.message}</p>
              )}
            </>
          )}

          <Input
            type="text"
            placeholder="Agencia / Broker"
            {...register("agenciaBroker")}
            required
          />
          {errors.agenciaBroker && (
            <p className="text-red-500">{errors.agenciaBroker.message}</p>
          )}

          <Input
            type="tel"
            placeholder="Número de Teléfono"
            {...register("numeroTelefono")}
            required
          />
          {errors.numeroTelefono && (
            <p className="text-red-500">{errors.numeroTelefono.message}</p>
          )}

          <select
            {...register("role")}
            className="block w-full mt-2 mb-4 p-2 border border-gray-300 rounded"
            required
          >
            <option value="" disabled selected>
              ¿Sos Team Leader / Broker o Asesor?
            </option>
            <option value="agente_asesor"> Asesor</option>
            <option value="team_leader_broker">Team Leader / Broker</option>
          </select>

          <div className="flex justify-between items-center mt-8">
            <Button
              type="submit"
              className="bg-mediumBlue hover:bg-mediumBlue/80 text-white py-2 px-4 rounded-md w-48"
            >
              Agregar Asesor
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-lightBlue text-white p-2 rounded hover:bg-lightBlue/80 transition-all duration-300 font-semibold w-48"
            >
              Cerrar
            </Button>
          </div>
        </form>

        <ModalOK
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          message={modalMessage}
          onAccept={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
};

export default AddUserModal;
