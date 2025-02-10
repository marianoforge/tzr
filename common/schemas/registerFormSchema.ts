import * as yup from 'yup';

export const createSchema = (googleUser: boolean) =>
  yup.object().shape({
    firstName: yup.string().required('Nombre es requerido'),
    lastName: yup.string().required('Apellido es requerido'),
    email: yup
      .string()
      .email('Correo inválido')
      .required('Correo es requerido'),
    agenciaBroker: yup.string().required('Agencia o Broker es requerido'),
    numeroTelefono: yup.string().required('Número de Teléfono es requerido'),
    // Validación condicional para contraseña solo si el usuario NO es de Google
    ...(googleUser !== true && {
      password: yup
        .string()
        .min(6, 'Contraseña debe tener al menos 6 caracteres')
        .required('Contraseña es requerida'),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), undefined], 'Las contraseñas no coinciden')
        .required('Confirmar contraseña es requerido'),
    }),
    currency: yup.string(),
    currencySymbol: yup.string(),
    noUpdates: yup.boolean(),
  });
