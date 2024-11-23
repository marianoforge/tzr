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
      <h2 className="text-lg font-bold mb-4">
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
              className="w-[200px] max-w-[200px]"
              {...field}
              error={errors.objetivoHonorariosAnuales?.message}
              labelSize="text-sm"
            />
          )}
        />
        <Input
          label="Volumen a Facturar"
          type="number"
          className="w-[200px] max-w-[200px]"
          value={volumenAFacturar}
          disabled
          labelSize="text-sm"
        />
        <Input
          label="Total de Puntas o Cierres"
          type="number"
          className="w-[200px] max-w-[200px]"
          value={totalPuntasCierres}
          labelSize="text-sm"
          disabled
        />
        <Input
          label="Total de Pre Listings"
          type="number"
          className="w-[200px] max-w-[200px]"
          value={totalPuntasCierresAnuales}
          labelSize="text-sm"
          disabled
        />
        <Input
          label="Total de Puntas Semanales"
          type="number"
          className="w-[200px] max-w-[200px]"
          value={totalPuntasCierresSemanales}
          labelSize="text-sm"
          disabled
        />
      </div>
    </div>
  );
};

export default ProjectionsObjective;
