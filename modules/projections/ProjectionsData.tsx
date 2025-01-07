import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';

import Input from '@/components/PrivateComponente/FormComponents/Input';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import { calculateTotals } from '@/common/utils/calculations';
import { currentYearOperations } from '@/common/utils/currentYearOps';
import { fetchUserOperations } from '@/lib/api/operationsApi';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';

import ProjectionsObjetive from './ProjectionsObjetive';

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
    isLoading,
    error,
  } = useQuery({
    queryKey: ['operations', userId],
    queryFn: () => fetchUserOperations(userId),
    enabled: !!userId,
  });

  if (error) {
    console.error('Error fetching operations:', error);
  }

  const currentYear = new Date().getFullYear();
  const totals = calculateTotals(
    currentYearOperations(operations, currentYear)
  );

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
      efectividad: 15,
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
  if (isLoading) {
    return (
      <div className="w-full">
        <SkeletonLoader height={60} count={10} />
      </div>
    );
  }
  return (
    <div className="bg-white p-4  rounded-xl shadow-md flex flex-col items-center w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
        Proyección de Efectividad
      </h2>
      <div className="flex flex-row">
        <form className="flex flex-col items-center">
          <div className="flex flex-col w-full mb-8">
            <h2 className=" font-bold mb-4">
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
                    className="w-[240px] max-w-[240px] min-w-[240px]"
                    labelSize="text-sm"
                    {...field}
                    error={errors.ticketPromedio?.message}
                    showTooltip={true}
                    tooltipContent="Cálculo del ticket promedio de las operaciones cerradas en el año."
                  />
                )}
              />
              <Controller
                name="promedioHonorariosNetos"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Promedio en % de honorarios netos"
                    type="number"
                    className="w-[240px] max-w-[240px] min-w-[240px]"
                    labelSize="text-sm"
                    {...field}
                    error={errors.promedioHonorariosNetos?.message}
                    showTooltip={true}
                    tooltipContent="Cálculo del porcentaje promedio de los honorarios netos de las operaciones cerradas en el año."
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
                    className="w-[240px] max-w-[240px] min-w-[240px]"
                    labelSize="text-sm"
                    {...field}
                    error={errors.efectividad?.message}
                    showTooltip={true}
                    tooltipContent="Segun las métricas de Pablo Viti el asesor inmobiliario promedio tiene cerca de 15% de efectividad. Los asesores mas experimentados pueden llegar a alcanzar un 35% de efectividad."
                  />
                )}
              />
              <Input
                label="Semanas del Año"
                type="number"
                className="w-[240px] max-w-[240px] min-w-[240px]"
                labelSize="text-sm"
                disabled
                value={semanasDelAno}
                showTooltip={true}
                tooltipContent="Si bien el año tiene 48 semanas, se calculan 52 ya que en Diciembre se empieza a trabajar posibles cierres del año siguiente"
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
      <div className="flex items-center mt-4 justify-center">
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="h-[42px] w-[200px] bg-mediumBlue text-white hover:bg-lightBlue transition-colors duration-300"
        >
          Calcular Proyección
        </Button>
      </div>
      <p className="text-gray-500 mt-4">By Métricas Pablo Viti - 2025</p>
    </div>
  );
};

export default ProjectionsData;
