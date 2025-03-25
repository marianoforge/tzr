import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import Input from '@/components/PrivateComponente/FormComponents/Input';

// Función para formatear números con separadores de miles
const formatNumberWithThousands = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Define el esquema con Yup
const schema = yup.object().shape({
  objetivoHonorariosAnuales: yup
    .number()
    .required('Objetivo Honorarios Anuales es requerido')
    .positive('Debe ser un número positivo'),
});

interface ProjectionsObjetiveProps {
  ticketPromedio: number;
  promedioHonorariosNetos: number;
  efectividad: number;
  semanasDelAno: number;
  onObjetivoChange?: (value: number) => void;
  initialObjetivoValue?: number;
}

const ProjectionsObjective = ({
  ticketPromedio,
  promedioHonorariosNetos,
  efectividad,
  semanasDelAno,
  onObjetivoChange,
  initialObjetivoValue = 0,
}: ProjectionsObjetiveProps) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      objetivoHonorariosAnuales: initialObjetivoValue,
    },
  });

  // Actualizar el valor cuando cambia initialObjetivoValue
  useEffect(() => {
    if (initialObjetivoValue > 0) {
      setValue('objetivoHonorariosAnuales', initialObjetivoValue);
    }
  }, [initialObjetivoValue, setValue]);

  const objetivoHonorariosAnuales = watch('objetivoHonorariosAnuales');

  // Evitar cálculos incorrectos si el valor es 0 o inválido
  const esValido =
    objetivoHonorariosAnuales > 0 &&
    promedioHonorariosNetos > 0 &&
    efectividad > 0 &&
    ticketPromedio > 0;

  const volumenAFacturar = esValido
    ? objetivoHonorariosAnuales / (promedioHonorariosNetos / 100)
    : 0;

  const totalPuntasCierres = esValido
    ? Number(volumenAFacturar) / ticketPromedio
    : 0;

  const totalPuntasCierresAnuales = esValido
    ? (Number(totalPuntasCierres) / efectividad) * 100
    : 0;

  const totalPuntasCierresSemanales = esValido
    ? Number(totalPuntasCierresAnuales) / semanasDelAno
    : 0;

  // Observar cambios en objetivoHonorariosAnuales y notificar al padre
  React.useEffect(() => {
    if (onObjetivoChange) {
      onObjetivoChange(objetivoHonorariosAnuales);
    }
  }, [objetivoHonorariosAnuales, onObjetivoChange]);

  return (
    <div className="flex flex-col w-full items-center">
      <h2 className="font-bold mb-4">
        Información sobre movimientos a efectuar
      </h2>
      <div className="flex flex-col w-full items-center">
        <Controller
          name="objetivoHonorariosAnuales"
          control={control}
          render={({ field }) => (
            <Input
              label="Objetivo Hon. Anuales Brutos"
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
          type="text"
          className="w-[240px] max-w-[240px] min-w-[240px]"
          value={formatNumberWithThousands(volumenAFacturar)} // ✅ Siempre seguro, no hay división por 0
          disabled
          labelSize="text-sm"
          showTooltip={true}
          tooltipContent="Cálculo del volumen a facturar en base a tu objetivo de honorarios anuales."
        />
        <Input
          label="Total de Puntas o Cierres"
          type="text"
          className="w-[240px] max-w-[240px] min-w-[240px]"
          value={formatNumberWithThousands(totalPuntasCierres)}
          labelSize="text-sm"
          disabled
          showTooltip={true}
          tooltipContent="Cálculo del total de puntas o cierres en base al volumen a facturar."
        />
        <Input
          label="Total de PL / PB"
          type="text"
          className="w-[240px] max-w-[240px] min-w-[240px]"
          value={formatNumberWithThousands(totalPuntasCierresAnuales)}
          labelSize="text-sm"
          disabled
          showTooltip={true}
          tooltipContent="Cálculo del total de pre listings / pre buying a realizar anualmente."
        />
        <Input
          label="Total de PL / PB Semanales"
          type="text"
          className="w-[240px] max-w-[240px] min-w-[240px]"
          value={formatNumberWithThousands(totalPuntasCierresSemanales)}
          labelSize="text-sm"
          disabled
          showTooltip={true}
          tooltipContent="Cálculo del total de PL / PB a realizar semanalmente"
        />
      </div>
    </div>
  );
};

export default ProjectionsObjective;
