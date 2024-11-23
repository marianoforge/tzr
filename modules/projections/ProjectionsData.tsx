import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';

import ProjectionsObjetive from './ProjectionsObjetive';

import Input from '@/components/PrivateComponente/FormComponents/Input';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import { calculateTotals } from '@/common/utils/calculations';
import { currentYearOperations } from '@/common/utils/currentYearOps';
import { fetchUserOperations } from '@/lib/api/operationsApi';

const schema = yup.object().shape({
  ticketPromedio: yup
    .number()
    .transform((value, originalValue) =>
      typeof originalValue === 'string' && originalValue.trim() === ''
        ? undefined
        : value
    )
    .required('Ticket Promedio is required')
    .positive('Must be positive'),
  promedioHonorariosNetos: yup
    .number()
    .transform((value, originalValue) =>
      typeof originalValue === 'string' && originalValue.trim() === ''
        ? undefined
        : value
    )
    .required('Promedio Honorarios Netos is required')
    .positive('Must be positive'),
  efectividad: yup
    .number()
    .transform((value, originalValue) =>
      typeof originalValue === 'string' && originalValue.trim() === ''
        ? undefined
        : value
    )
    .required('Efectividad is required')
    .min(0, 'Must be at least 0')
    .max(100, 'Must be at most 100'),
});

const ProjectionsData = ({ userId }: { userId: string }) => {
  const {
    data: operations = [],
    // isLoading,
    // error: operationsError,
  } = useQuery({
    queryKey: ['operations', userId],
    queryFn: () => fetchUserOperations(userId),
    enabled: !!userId,
  });

  const totals = calculateTotals(currentYearOperations(operations));

  const ticketPromedio = (
    totals.valor_reserva / totals.cantidad_operaciones
  ).toFixed(2);
  const promedioHonorariosNetos = (
    ((totals.honorarios_asesor_cerradas ?? 0) / (totals.valor_reserva ?? 1)) *
    100
  ).toFixed(2);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ticketPromedio: 0,
      promedioHonorariosNetos: 0,
      efectividad: 0,
    },
  });

  const semanasDelAno = 52;

  const [formData, setFormData] = useState({
    ticketPromedio: 0,
    promedioHonorariosNetos: 0,
    efectividad: 0,
  });

  useEffect(() => {
    setValue('ticketPromedio', Number(ticketPromedio));
    setValue('promedioHonorariosNetos', Number(promedioHonorariosNetos));
  }, [ticketPromedio, promedioHonorariosNetos, setValue]);

  const onSubmit = (
    data: React.SetStateAction<{
      ticketPromedio: number;
      promedioHonorariosNetos: number;
      efectividad: number;
    }>
  ) => {
    setFormData(data);
  };

  return (
    <div className="bg-white p-4 mt-20 rounded-xl shadow-md flex flex-col items-center w-full">
      <div className="flex flex-row">
        <form className="flex flex-col items-center">
          <div className="flex flex-col w-full mb-8">
            <h2 className="text-lg font-bold mb-4">
              Edita tus números para ver distintas proyecciones
            </h2>
            <div className="flex flex-col w-full  items-center">
              <Controller
                name="ticketPromedio"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Ticket Promedio"
                    type="number"
                    className="w-[200px] max-w-[200px]"
                    labelSize="text-sm"
                    {...field}
                    error={errors.ticketPromedio?.message}
                  />
                )}
              />
              <Controller
                name="promedioHonorariosNetos"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Promedio % de hon. netos"
                    type="number"
                    className="w-[200px] max-w-[200px]"
                    labelSize="text-sm"
                    {...field}
                    error={errors.promedioHonorariosNetos?.message}
                  />
                )}
              />
              <Controller
                name="efectividad"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Efectividad (%)"
                    type="number"
                    className="w-[200px] max-w-[200px]"
                    labelSize="text-sm"
                    {...field}
                    error={errors.efectividad?.message}
                  />
                )}
              />
              <Input
                label="Semanas del Año"
                type="number"
                className="w-[200px] max-w-[200px]"
                labelSize="text-sm"
                disabled
                value={semanasDelAno}
              />
            </div>
          </div>
        </form>
        <ProjectionsObjetive
          ticketPromedio={formData.ticketPromedio}
          promedioHonorariosNetos={formData.promedioHonorariosNetos}
          efectividad={formData.efectividad}
          semanasDelAno={semanasDelAno}
        />
      </div>
      <div className="flex justify-center items-center mt-4">
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="h-[42px] w-[200px]"
        >
          Calcular
        </Button>
      </div>
    </div>
  );
};

export default ProjectionsData;
