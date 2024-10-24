import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Import Tanstack Query

import { useAuthStore } from '@/stores/authStore';
import Input from '@/components/TrackerComponents/FormComponents/Input';
import TextArea from '@/components/TrackerComponents/FormComponents/TextArea';
import Button from '@/components/TrackerComponents/FormComponents/Button';
import { createEvent } from '@/lib/api/eventsApi'; // Import the createEvent function from the events API

import ModalOK from '../ModalOK';

// Esquema de validación con Yup
const schema = yup.object().shape({
  title: yup.string().required('El título es requerido'),
  date: yup.string().required('La fecha es requerida'),
  startTime: yup.string().required('La hora de inicio es requerida'),
  endTime: yup.string().required('La hora de fin es requerida'),
  description: yup.string().required('La descripción es requerida'),
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
  const [modalMessage, setModalMessage] = useState('');
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
  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', userID] });
      setModalMessage('Evento guardado exitosamente');
      setIsModalOpen(true);
      reset();
    },
    onError: () => {
      setModalMessage('Error al agendar el evento');
      setIsModalOpen(true);
    },
  });

  // Memoize the onSubmit function
  const onSubmit: SubmitHandler<EventFormData> = useCallback(
    async (data) => {
      if (!userID) {
        setModalMessage('No se proporcionó un ID de usuario válido');
        setIsModalOpen(true);
        return;
      }

      const eventData = {
        ...data,
        user_uid: userID,
      };

      mutation.mutate(eventData);
    },
    [userID, mutation]
  );

  return (
    <div className="flex flex-col justify-center items-center mt-20">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white rounded-lg shadow-md w-full xl:w-[80%] 2xl:w-[70%]"
      >
        <h2 className="text-2xl mb-4 font-semibold">Agendar Evento</h2>
        <div className="flex flex-wrap -mx-2">
          <div className="w-full px-2">
            <Input
              label="Título del evento"
              type="text"
              placeholder="Título del evento"
              {...register('title')}
              error={errors.title?.message}
              required
            />

            <Input
              label="Fecha del evento"
              type="date"
              {...register('date')}
              error={errors.date?.message}
              required
            />

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <Input
                  label="Hora de inicio"
                  type="time"
                  {...register('startTime')}
                  error={errors.startTime?.message}
                  required
                />
              </div>
              <div className="w-1/2">
                <Input
                  label="Hora de fin"
                  type="time"
                  {...register('endTime')}
                  error={errors.endTime?.message}
                  required
                />
              </div>
            </div>

            <TextArea
              label="Descripción del evento"
              placeholder="Descripción del evento"
              {...register('description')}
              error={errors.description?.message}
              required
            />
          </div>
        </div>
        <div className="flex justify-center items-center mt-8">
          <Button
            type="submit"
            className="bg-mediumBlue hover:bg-lightBlue text-white p-2 rounded  transition-all duration-300 font-semibold w-[200px] cursor-pointer"
          >
            Guardar Evento
          </Button>
        </div>
        <ModalOK
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          message={modalMessage}
          onAccept={() => router.push('/dashboard')}
        />
      </form>
    </div>
  );
};

export default FormularioEvento;
