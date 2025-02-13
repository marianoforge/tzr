import * as yup from 'yup';

export const schema = yup.object().shape({
  fecha_operacion: yup.string().required('La fecha de operación es requerida'),
  fecha_cierre: yup.string().nullable(),
  direccion_reserva: yup
    .string()
    .required('La dirección de reserva es requerida'),
  numero_casa: yup.string().nullable(),
  localidad_reserva: yup.string().nullable(),
  provincia_reserva: yup.string().nullable(),
  tipo_operacion: yup.string().required('El tipo de operación es requerido'),
  valor_reserva: yup
    .number()
    .typeError('El valor de reserva debe ser un número')
    .positive('El valor de reserva debe ser positivo')
    .required('El valor de reserva es requerido'),

  porcentaje_honorarios_broker: yup
    .number()
    .typeError('Debe ser un número')
    .min(0, 'No puede ser negativo'),

  porcentaje_punta_compradora: yup
    .number()
    .required('Porcentaje de punta compradora es requerido')
    .typeError('Debe ser un número')
    .min(0, 'No puede ser negativo'),
  porcentaje_punta_vendedora: yup
    .number()
    .required('Porcentaje de punta compradora es requerido')
    .typeError('Debe ser un número')
    .min(0, 'No puede ser negativo'),
  punta_compradora: yup.boolean().required(),
  punta_vendedora: yup.boolean().required(),
  exclusiva: yup.boolean().required(),
  no_exclusiva: yup.boolean().required(),
  numero_sobre_reserva: yup.string().nullable(),
  numero_sobre_refuerzo: yup.string().nullable(),
  monto_sobre_reserva: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      typeof originalValue === 'string' && originalValue.trim() === ''
        ? 0
        : value
    ),
  monto_sobre_refuerzo: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      typeof originalValue === 'string' && originalValue.trim() === ''
        ? 0
        : value
    ),
  referido: yup.string().nullable(),
  compartido: yup.string().nullable(),
  porcentaje_compartido: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      typeof originalValue === 'string' && originalValue.trim() === ''
        ? 0
        : value
    ),
  porcentaje_referido: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      typeof originalValue === 'string' && originalValue.trim() === ''
        ? 0
        : value
    ),
  realizador_venta: yup
    .string()
    .nullable()
    .notRequired()
    .transform((value) => (value === '' ? null : value)),
  porcentaje_honorarios_asesor: yup
    .number()
    .typeError('Debe ser un número')
    .min(0, 'No puede ser negativo')
    .nullable(),
  realizador_venta_adicional: yup.string().nullable(),
  porcentaje_honorarios_asesor_adicional: yup
    .number()
    .typeError('Debe ser un número')
    .min(0, 'No puede ser negativo')
    .nullable(),
  estado: yup.string().required('El estado es requerido'),
  observaciones: yup.string().nullable(),
  pais: yup.string(),
  isFranchiseOrBroker: yup.number().nullable(),
  reparticion_honorarios_asesor: yup.number().nullable(),
});
