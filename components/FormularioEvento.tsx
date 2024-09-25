import React, { useState, useCallback } from "react";

const FormularioEvento = ({ user_uid }: { user_uid: string }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
  });

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

    if (!user_uid) {
      alert("No se proporcionó un ID de usuario válido");
      return;
    }

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          user_uid, // Usa el user_uid proporcionado como prop
        }),
      });

      if (!response.ok) {
        throw new Error("Error al agendar el evento");
      }

      const result = await response.json();
      alert(result.message);

      // Limpiar el formulario
      setFormData({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        description: "",
      });
    } catch (error) {
      console.error("Error al agendar el evento:", error);
      alert("Error al agendar el evento");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
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
    </form>
  );
};

export default FormularioEvento;
