import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import Button from "./FormComponents/Button";
import Input from "./FormComponents/Input";
import ModalOK from "./ModalOK";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";

interface AddUserModalProps {
  onClose: () => void;
}

export const createSchema = () =>
  yup.object().shape({
    firstName: yup.string().required("Nombre es requerido"),
    lastName: yup.string().required("Apellido es requerido"),
    email: yup.string().email("Correo inválido").nullable(),
    numeroTelefono: yup.string().nullable(),
  });

export interface TeamMemberRequestBody {
  email?: string;
  firstName: string;
  lastName: string;
  numeroTelefono?: string;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose }) => {
  const router = useRouter();
  const { userID } = useAuthStore();
  const schema = createSchema();

  // Estado para almacenar el token CSRF
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamMemberRequestBody>({
    resolver: yupResolver(schema) as Resolver<TeamMemberRequestBody>,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [formError, setFormError] = useState("");

  // Obtener el CSRF token cuando se carga el componente
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("/api/users/teamMembers", {
          method: "GET",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken); // Guardar el CSRF token en el estado
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };

    fetchCsrfToken(); // Llamar a la función para obtener el token
  }, []);

  // Usar useMutation para manejar la solicitud POST
  const mutation = useMutation<unknown, Error, TeamMemberRequestBody>({
    mutationFn: async (data: TeamMemberRequestBody) => {
      if (!userID) {
        throw new Error("El UID del usuario es requerido");
      }

      const response = await fetch("/api/users/teamMembers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken || "", // Enviar el token CSRF en los headers
        },
        body: JSON.stringify({
          uid: userID, // Incluir el UID del usuario
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar usuario");
      }

      return response.json();
    },
    onSuccess: () => {
      setModalMessage("Se ha agregado un nuevo asesor.");
      setIsModalOpen(true);
      reset();
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unknown error occurred");
      }
    },
  });

  const onSubmit: SubmitHandler<TeamMemberRequestBody> = (data) => {
    mutation.mutate(data);
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
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}

          <Input
            type="tel"
            placeholder="Número de Teléfono"
            {...register("numeroTelefono")}
          />
          {errors.numeroTelefono && (
            <p className="text-red-500">{errors.numeroTelefono.message}</p>
          )}

          <div className="flex justify-between items-center mt-8">
            <Button
              type="submit"
              className="bg-mediumBlue hover:bg-lightBlue text-white py-2 px-4 rounded-md w-48"
            >
              Agregar Asesor
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-lightBlue text-white p-2 rounded hover:bg-mediumBlue transition-all duration-300 font-semibold w-48"
            >
              Cerrar
            </Button>
          </div>
        </form>

        <ModalOK
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            onClose(); // Cerrar el modal principal también
          }}
          message={modalMessage}
          onAccept={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
};

export default AddUserModal;
