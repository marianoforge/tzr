import React from "react";
import { EventModalProps } from "@/types";
import { formatEventDateTime } from "@/utils/formatEventDateTime";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Importar Tanstack Query
import { deleteEvent } from "@/lib/api/eventsApi"; // Asegúrate de tener estas funciones implementadas

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
  const queryClient = useQueryClient();

  // Mutation para actualizar un evento

  // Mutation para eliminar un evento
  const mutationDelete = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] }); // Invalida la cache de eventos tras eliminar
      onClose(); // Cerrar el modal tras la eliminación
    },
  });

  // Manejar la eliminación del evento
  const handleDeleteClick = () => {
    if (event?.id) {
      mutationDelete.mutate(event.id);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center font-bold md:w-[50%] lg:w-[40%] h-[30%] flex flex-col justify-center w-[90%]">
        <div className="flex flex-col gap-1 h-[30%]">
          <p>
            Comienzo:{" "}
            <span className="font-normal">
              {formatEventDateTime(new Date(event.startTime))}
            </span>
          </p>
          <p>
            Fin:{" "}
            <span className="font-normal">
              {formatEventDateTime(new Date(event.endTime))}
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-1 h-[20%]">
          <h2 className="text-lg mb-4">{event.title}</h2>
        </div>
        <div className="h-[40%] text-left">
          <p className="mb-4 text-base font-normal">{event.description}</p>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handleDeleteClick} // Botón para eliminar el evento
            className="bg-redAccent text-white p-2 rounded hover:bg-red-700 transition-all duration-300 font-bold w-full"
          >
            Eliminar
          </button>

          <button
            onClick={onClose}
            className="bg-greenAccent text-white p-2 rounded hover:bg-green-600 transition-all duration-300 font-bold w-full "
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
