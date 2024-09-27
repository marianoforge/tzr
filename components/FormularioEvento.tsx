import React, { useState, useCallback } from "react";
import axios from "axios"; // Import axios
import ModalOK from "./ModalOK"; // Import ModalOK
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";

const FormularioEvento: React.FC = () => {
  const { userID } = useAuthStore();
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
        className="p-6 bg-white rounded shadow-md w-[50%]"
      >
        <h2 className="text-2xl mb-4">Agendar Evento</h2>
        <div className="flex flex-wrap -mx-2">
          <div className="w-full px-2">
            <input
              type="text"
              name="title"
              placeholder="Título del evento"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            <div className="flex gap-4 mb-4">
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-1/2 p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-1/2 p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <textarea
              name="description"
              placeholder="Descripción del evento"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              rows={4}
              required
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#7ED994] text-white p-2 rounded hover:bg-[#7ED994]/80 transition-all duration-300 font-bold"
          >
            Agendar Evento
          </button>
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
