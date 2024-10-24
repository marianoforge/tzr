import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EventModalProps } from '@/types';
import { formatEventDateTime } from '@/utils/formatEventDateTime';
import { deleteEvent } from '@/lib/api/eventsApi';

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
  const queryClient = useQueryClient();

  const mutationDelete = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
    },
  });

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
            Comienzo:{' '}
            <span className="font-normal">
              {formatEventDateTime(new Date(event.startTime))}
            </span>
          </p>
          <p>
            Fin:{' '}
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
            onClick={handleDeleteClick}
            className="bg-mediumBlue text-white p-2 rounded hover:bg-lightBlue transition-all duration-300 font-bold w-full"
          >
            Eliminar
          </button>

          <button
            onClick={onClose}
            className="bg-lightBlue text-white p-2 rounded hover:bg-mediumBlue transition-all duration-300 font-bold w-full "
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
