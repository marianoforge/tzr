import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Input from '@/components/PrivateComponente/FormComponents/Input';
import Button from '@/components/PrivateComponente/FormComponents/Button';

export interface WeekData {
  actividadVerde?: string | undefined;
  contactosReferidos?: string | undefined;
  preBuying?: string | undefined;
  preListing?: string | undefined;
  captaciones?: string | undefined;
  reservas?: string | undefined;
  cierres?: string | undefined;
  semana?: number;
}

interface ProjectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowData: WeekData;
  rowIndex: number; // Para identificar qué fila se está editando
  userID: string;
}

const schema = yup.object().shape({
  actividadVerde: yup.string(),
  contactosReferidos: yup.string(),
  preBuying: yup.string(),
  preListing: yup.string(),
  captaciones: yup.string(),
  reservas: yup.string(),
  cierres: yup.string(),
  semana: yup.number(),
});

const ProjectionsModal: React.FC<ProjectionsModalProps> = ({
  isOpen,
  onClose,
  rowData,
  rowIndex,
  userID,
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: WeekData) => {
      const response = await fetch('/api/updateWeek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber: rowIndex + 1,
          userID,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update week data');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks', userID] });
      onClose();
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      actividadVerde: rowData.actividadVerde,
      contactosReferidos: rowData.contactosReferidos,
      preBuying: rowData.preBuying,
      preListing: rowData.preListing,
      captaciones: rowData.captaciones,
      reservas: rowData.reservas,
      cierres: rowData.cierres,
      semana: rowData.semana,
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: WeekData) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg font-bold w-[50%] h-auto flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Editar Proyección Semanal
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="actividadVerde"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Actividad Verde"
                error={errors.actividadVerde?.message as string}
              />
            )}
          />
          <Controller
            name="contactosReferidos"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Contactos / Referidos"
                error={errors.contactosReferidos?.message as string}
              />
            )}
          />
          <Controller
            name="preBuying"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Pre Buying"
                error={errors.preBuying?.message as string}
              />
            )}
          />
          <Controller
            name="preListing"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Pre Listing"
                error={errors.preListing?.message as string}
              />
            )}
          />
          <Controller
            name="captaciones"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Captaciones"
                error={errors.captaciones?.message as string}
              />
            )}
          />
          <Controller
            name="reservas"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Reservas"
                error={errors.reservas?.message as string}
              />
            )}
          />
          <Controller
            name="cierres"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Cierres"
                error={errors.cierres?.message as string}
              />
            )}
          />
          <div className="flex justify-center gap-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-mediumBlue text-white hover:bg-lightBlue transition-colors duration-300 w-[210px]"
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-lightBlue text-white hover:bg-mediumBlue transition-colors duration-300 w-[210px]"
            >
              Cancelar
            </Button>
          </div>
          {mutation.isError && (
            <p className="text-red-500 mt-2">Error guardando los datos.</p>
          )}
          {mutation.isSuccess && (
            <p className="text-green-500 mt-2">Datos guardados con éxito.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProjectionsModal;
