import * as yup from 'yup';

export const schema = yup.object().shape({
  title: yup.string().required('El título es obligatorio'),
  date: yup.string().required('La fecha es obligatoria'),
  startTime: yup.string().required('La hora de inicio es obligatoria'),
  endTime: yup.string().required('La hora de fin es obligatoria'),
  description: yup.string(),
});
