import React, { useState, useCallback } from "react";
import axios from "axios"; // Import axios
import ModalOK from "./ModalOK"; // Import ModalOK
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";
import { useEventsStore } from "@/stores/useEventsStore";
import Input from "./FormComponents/Input";
import TextArea from "./FormComponents/TextArea";
import Button from "./FormComponents/Button";

const FormularioEvento: React.FC = () => {
  const { userID } = useAuthStore();
  const { fetchEvents } = useEventsStore();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // Add state for modal
  const [modalMessage, setModalMessage] = useState(""); // Add state for modal message
  const router = useRouter();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userID) {
      setModalMessage("No se proporcionó un ID de usuario válido");
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await axios.post("/api/events", {
        ...formData,
        user_uid: userID,
      });

      setModalMessage(response.data.message);
      setIsModalOpen(true);

      setFormData({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        description: "",
      });

      await fetchEvents("user_id"); // Llama a fetchEvents después de publicar el evento
    } catch (error) {
      console.error("Error al agendar el evento:", error);
      setModalMessage("Error al agendar el evento");
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded shadow-md w-[100%]"
      >
        <h2 className="text-2xl mb-4">Agendar Evento</h2>
        <div className="flex flex-wrap -mx-2">
          <div className="w-full px-2">
            <Input
              type="text"
              name="title"
              placeholder="Título del evento"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <div className="flex gap-4 mb-4">
              <Input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
              <Input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
            <TextArea
              name="description"
              placeholder="Descripción del evento"
              value={formData.description}
              onChange={handleChange}
              required
            />
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
