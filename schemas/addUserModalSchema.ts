import * as yup from 'yup';

export const createSchema = () =>
  yup.object().shape({
    firstName: yup.string().required('Nombre es requerido'),
    lastName: yup.string().required('Apellido es requerido'),
    email: yup.string().email('Correo inválido').nullable(),
    numeroTelefono: yup.string().nullable(),
  });
