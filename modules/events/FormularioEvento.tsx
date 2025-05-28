import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Input from '@/components/PrivateComponente/FormComponents/Input';
import TextArea from '@/components/PrivateComponente/FormComponents/TextArea';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import { useEventMutation } from '@/common/hooks/useEventMutation';
import ModalOK from '@/components/PrivateComponente/CommonComponents/Modal';
import { schema } from '@/common/schemas/eventFormSchema';

const FormularioEvento: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const { isModalOpen, modalMessage, onSubmit, closeModal, acceptModal } =
    useEventMutation(reset);

  return (
    <div className="flex flex-col justify-center items-center mt-4">
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
            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <Input
                  label="Fecha del evento"
                  type="date"
                  {...register('date')}
                  error={errors.date?.message}
                  required
                />
              </div>
              <div className="w-1/2">
                <Input
                  label="Dirección del Evento"
                  type="text"
                  {...register('address')}
                  error={errors.address?.message}
                  required
                />
              </div>
            </div>
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
          onClose={closeModal}
          message={modalMessage}
          onAccept={acceptModal}
        />
      </form>
    </div>
  );
};

export default FormularioEvento;
