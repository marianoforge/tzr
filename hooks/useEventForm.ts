import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { EventFormData } from '@/types';

// Esquema de validación con Yup
const schema = yup.object().shape({
  title: yup.string().required('El título es requerido'),
  date: yup.string().required('La fecha es requerida'),
  startTime: yup.string().required('La hora de inicio es requerida'),
  endTime: yup.string().required('La hora de fin es requerida'),
  description: yup.string().required('La descripción es requerida'),
});

export const useEventForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: yupResolver(schema),
  });

  return { register, handleSubmit, errors, reset };
};
