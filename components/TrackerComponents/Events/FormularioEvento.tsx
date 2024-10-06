import React, { useState } from "react";
import ModalOK from "../ModalOK";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";
import Input from "@/components/TrackerComponents/FormComponents/Input";
import TextArea from "@/components/TrackerComponents/FormComponents/TextArea";
import Button from "@/components/TrackerComponents/FormComponents/Button";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import Tanstack Query
import { createEvent } from "@/lib/api/eventsApi"; // Import the createEvent function from the events API

// Esquema de validación con Yup
const schema = yup.object().shape({
  title: yup.string().required("El título es requerido"),
  date: yup.string().required("La fecha es requerida"),
  startTime: yup.string().required("La hora de inicio es requerida"),
  endTime: yup.string().required("La hora de fin es requerida"),
  description: yup.string().required("La descripción es requerida"),
});

// Interfaz para el formulario de eventos
export interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

const FormularioEvento: React.FC = () => {
  const { userID } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter();

  // Configuración de react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: yupResolver(schema),
  });

  // Mutación para crear un nuevo evento usando Tanstack Query
  const mutation = useMutation({
    mutationFn: createEvent, // Función que crea el evento
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", userID] }); // Invalidar cache para recargar eventos
      setModalMessage("Evento guardado exitosamente");
      setIsModalOpen(true);
      reset(); // Resetear el formulario tras éxito
    },
    onError: () => {
      setModalMessage("Error al agendar el evento");
      setIsModalOpen(true);
    },
  });

  // Manejar la presentación del formulario
  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    if (!userID) {
      setModalMessage("No se proporcionó un ID de usuario válido");
      setIsModalOpen(true);
      return;
    }

    const eventData = {
      ...data,
      user_uid: userID,
    };

    mutation.mutate(eventData);
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white rounded shadow-md w-full xl:w-[80%] 2xl:w-[70%]"
      >
        <h2 className="text-2xl mb-4">Agendar Evento</h2>
        <div className="flex flex-wrap -mx-2">
          <div className="w-full px-2">
            <Input
              type="text"
              placeholder="Título del evento"
              {...register("title")}
              required
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}

            <Input type="date" {...register("date")} required />
            {errors.date && (
              <p className="text-red-500">{errors.date.message}</p>
            )}

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <Input type="time" {...register("startTime")} required />
                {errors.startTime && (
                  <p className="text-red-500">{errors.startTime.message}</p>
                )}
              </div>
              <div className="w-1/2">
                <Input type="time" {...register("endTime")} required />
                {errors.endTime && (
                  <p className="text-red-500">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            <TextArea
              placeholder="Descripción del evento"
              {...register("description")}
              required
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>
        <div className="flex justify-center lg:justify-end items-center mt-8">
          <Button
            type="submit"
            className="bg-greenAccent text-white p-2 rounded hover:bg-green-600 transition-all duration-300 font-semibold w-[200px] cursor-pointer"
          >
            Guardar Evento
          </Button>
        </div>
        <ModalOK
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          message={modalMessage}
          onAccept={() => router.push("/dashboard")}
        />
      </form>
    </div>
  );
};

export default FormularioEvento;
