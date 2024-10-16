import * as yup from "yup";

export const schema = yup.object().shape({
  fecha_operacion: yup.string().required("La fecha de operación es requerida"),
  direccion_reserva: yup
    .string()
    .required("La dirección de reserva es requerida"),
  tipo_operacion: yup.string().required("El tipo de operación es requerido"),
  valor_reserva: yup
    .number()
    .typeError("El valor de reserva debe ser un número")
    .positive("El valor de reserva debe ser positivo")
    .required("El valor de reserva es requerido"),
  porcentaje_honorarios_asesor: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("Porcentaje de honorarios asesor es requerido"),
  porcentaje_honorarios_broker: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("Porcentaje de honorarios broker es requerido"),
  porcentaje_punta_compradora: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo"),
  porcentaje_punta_vendedora: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo"),
  punta_compradora: yup.boolean().required(),
  punta_vendedora: yup.boolean().required(),
  numero_sobre_reserva: yup.string().nullable(),
  numero_sobre_refuerzo: yup.string().nullable(),
  monto_sobre_reserva: yup.number().nullable(),
  monto_sobre_refuerzo: yup.number().nullable(),
  referido: yup.string().nullable(),
  compartido: yup.string().nullable(),
  porcentaje_compartido: yup.number().nullable(),
  porcentaje_referido: yup.number().nullable(),
  estado: yup.string().required("El estado es requerido"),
});
