import React, { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import ModalOK from '@/components/PrivateComponente/CommonComponents/Modal';
import { createSchema } from '@/common/schemas/addUserModalSchema';
import { TeamMemberRequestBody } from '@/common/types/';

import useAddAgent from '@/common/hooks/useAddAgent';
import Input from '@/components/PrivateComponente/FormComponents/Input';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import { QueryKeys } from '@/common/enums';

interface AddUserModalProps {
  onClose: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const schema = createSchema();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamMemberRequestBody>({
    resolver: yupResolver(schema),
  });

  const { addUser, formError, isLoading } = useAddAgent(() => {
    setModalMessage('Se ha agregado un nuevo asesor.');
    setIsModalOpen(true);
    reset();

    // Invalidar queries después de agregar un usuario
    queryClient.invalidateQueries({ queryKey: [QueryKeys.TEAM_MEMBERS] });
  });

  const onSubmit: SubmitHandler<TeamMemberRequestBody> = (data) => {
    addUser(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 pt-4 rounded-xl shadow-lg text-center font-bold w-auto h-auto max-h-[90vh] overflow-y-auto flex flex-col justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 pt-4 w-11/12 max-w-lg rounded-lg"
        >
          <h2 className="text-2xl mb-6 text-center">Agregar Asesor</h2>
          {formError && <p className="text-red-500 mb-4">{formError}</p>}

          <Input
            type="text"
            placeholder="Nombre"
            {...register('firstName')}
            required
          />
          {errors.firstName && (
            <p className="text-red-500">{errors.firstName.message}</p>
          )}

          <Input
            type="text"
            placeholder="Apellido"
            {...register('lastName')}
            required
          />
          {errors.lastName && (
            <p className="text-red-500">{errors.lastName.message}</p>
          )}

          <Input
            type="email"
            placeholder="Correo electrónico"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}

          <Input
            type="tel"
            placeholder="Número de Teléfono"
            {...register('numeroTelefono')}
          />
          {errors.numeroTelefono && (
            <p className="text-red-500">{errors.numeroTelefono.message}</p>
          )}

          <div className="flex justify-between items-center mt-8 gap-4">
            <Button
              type="submit"
              className="bg-mediumBlue hover:bg-lightBlue text-white py-2 px-4 rounded-md w-48"
              disabled={isLoading}
            >
              {isLoading ? 'Agregando...' : 'Agregar Asesor'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-lightBlue text-white p-2 rounded hover:bg-mediumBlue transition-all duration-300 font-semibold w-48"
            >
              Cerrar
            </Button>
          </div>
        </form>

        <ModalOK
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            onClose();
          }}
          message={modalMessage}
        />
      </div>
    </div>
  );
};

export default AddUserModal;
