import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import Input from '@/components/PrivateComponente/FormComponents/Input';

// Define the schema using yup
const schema = yup.object().shape({
  objetivoHonorariosAnuales: yup
    .number()
    .required('Objetivo Honorarios Anuales is required')
    .positive('Must be positive'),
});

interface ProjectionsObjetiveProps {
  ticketPromedio: number;
  promedioHonorariosNetos: number;
  efectividad: number;
  semanasDelAno: number;
}

const ProjectionsObjective = ({
  ticketPromedio,
  promedioHonorariosNetos,
  efectividad,
  semanasDelAno,
}: ProjectionsObjetiveProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      objetivoHonorariosAnuales: 0,
    },
  });

  const objetivoHonorariosAnuales = watch('objetivoHonorariosAnuales');
  const volumenAFacturar = (
    objetivoHonorariosAnuales /
    (promedioHonorariosNetos / 100)
  ).toFixed(2);
  const totalPuntasCierres = (
    Number(volumenAFacturar) / ticketPromedio
  ).toFixed(2);
  const totalPuntasCierresAnuales = (
    (Number(totalPuntasCierres) / efectividad) *
    100
  ).toFixed(2);
  const totalPuntasCierresSemanales = (
    Number(totalPuntasCierresAnuales) / semanasDelAno
  ).toFixed(2);

  return (
    <div className="flex flex-col w-full items-center">
      <h2 className=" font-bold mb-4">
        Información sobre movimientos a efectar
      </h2>
      <div className="flex flex-col w-full items-center">
        <Controller
          name="objetivoHonorariosAnuales"
          control={control}
          render={({ field }) => (
            <Input
              label="Objetivo Hon. Anuales"
              type="number"
              className="w-[240px] max-w-[240px] min-w-[240px]"
              {...field}
              error={errors.objetivoHonorariosAnuales?.message}
              labelSize="text-sm"
              showTooltip={true}
              tooltipContent="Ingresa tu objetivo de honorarios anuales."
            />
          )}
        />
        <Input
          label="Volumen a Facturar"
          type="number"
          className="w-[240px] max-w-[240px] min-w-[240px]"
          value={volumenAFacturar}
          disabled
          labelSize="text-sm"
          showTooltip={true}
          tooltipContent="Cálculo del volumen a facturar en base a tu objetivo de honorarios anuales."
        />
        <Input
          label="Total de Puntas o Cierres"
          type="number"
          className="w-[240px] max-w-[240px] min-w-[240px]"
          value={totalPuntasCierres}
          labelSize="text-sm"
          disabled
          showTooltip={true}
          tooltipContent="Cálculo del total de puntas o cierres en base al volumen a facturar."
        />
        <Input
          label="Total de Pre Listings"
          type="number"
          className="w-[240px] max-w-[240px] min-w-[240px]"
          value={totalPuntasCierresAnuales}
          labelSize="text-sm"
          disabled
          showTooltip={true}
          tooltipContent="Cálculo del total de pre listings en base al total de puntas o cierres anuales."
        />
        <Input
          label="Total de Puntas Semanales"
          type="number"
          className="w-[240px] max-w-[240px] min-w-[240px]"
          value={totalPuntasCierresSemanales}
          labelSize="text-sm"
          disabled
          showTooltip={true}
          tooltipContent="Cálculo del total de puntas semanales en base al total de pre listings anuales."
        />
      </div>
    </div>
  );
};

export default ProjectionsObjective;
