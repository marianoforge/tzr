import React from "react";
import { EventModalProps } from "@/types"; // Import Event type
import { formatEventDateTime } from "@/utils/formatEvent.DateTime";

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
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

        <button
          onClick={onClose}
          className="bg-[#7ED994] text-white p-2 rounded hover:bg-[#7ED994]/80 transition-all duration-300 font-bold w-full"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default EventModal;
