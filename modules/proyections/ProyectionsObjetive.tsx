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

interface ProyectionsObjetiveProps {
  ticketPromedio: number;
  promedioHonorariosNetos: number;
  efectividad: number;
  semanasDelAno: number;
}

const ProyectionsObjective = ({
  ticketPromedio,
  promedioHonorariosNetos,
  efectividad,
  semanasDelAno,
}: ProyectionsObjetiveProps) => {
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
    <div className="flex flex-col w-full">
      <h2 className="text-lg font-bold mb-4">
        Información sobre movimientos a efectar
      </h2>
      <div className="flex flex-row w-full gap-4 justify-around">
        <Controller
          name="objetivoHonorariosAnuales"
          control={control}
          render={({ field }) => (
            <Input
              label="Objetivo Honorarios Anuales (USD)"
              type="number"
              className="w-[240px] max-w-[240px]"
              {...field}
              error={errors.objetivoHonorariosAnuales?.message}
            />
          )}
        />
        <Input
          label="Volumen a Facturar"
          type="number"
          className="w-[240px] max-w-[240px]"
          value={volumenAFacturar}
          disabled
        />
        <Input
          label="Total de Puntas o Cierres"
          type="number"
          className="w-[240px] max-w-[240px]"
          value={totalPuntasCierres}
          disabled
        />
        <Input
          label="Total de Pre Listings"
          type="number"
          className="w-[240px] max-w-[240px]"
          value={totalPuntasCierresAnuales}
          disabled
        />
        <Input
          label="Total de Puntas o Cierres Semanales"
          type="number"
          className="w-[240px] max-w-[240px]"
          value={totalPuntasCierresSemanales}
          disabled
        />
      </div>
    </div>
  );
};

export default ProyectionsObjective;
