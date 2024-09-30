import React, { useState } from "react";
import axios from "axios";
import ModalOK from "./ModalOK";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";
import { useEventsStore } from "@/stores/useEventsStore";
import Input from "./FormComponents/Input";
import TextArea from "./FormComponents/TextArea";
import Button from "./FormComponents/Button";

import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  title: yup.string().required("El título es requerido"),
  date: yup.string().required("La fecha es requerida"),
  startTime: yup.string().required("La hora de inicio es requerida"),
  endTime: yup.string().required("La hora de fin es requerida"),
  description: yup.string().required("La descripción es requerida"),
});

interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

const FormularioEvento: React.FC = () => {
  const { userID } = useAuthStore();
  const { fetchEvents } = useEventsStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: yupResolver(schema),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const router = useRouter();

  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    if (!userID) {
      setModalMessage("No se proporcionó un ID de usuario válido");
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await axios.post("/api/events", {
        ...data,
        user_uid: userID,
      });

      setModalMessage(response.data.message);
      setIsModalOpen(true);

      reset(); // Reset the form after successful submission

      await fetchEvents("user_id"); // Fetch events after submission
    } catch (error) {
      console.error("Error al agendar el evento:", error);
      setModalMessage("Error al agendar el evento");
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white rounded shadow-md w-[100%]"
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
        <div className="flex justify-end">
          <Button type="submit">Agendar Evento</Button>
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
