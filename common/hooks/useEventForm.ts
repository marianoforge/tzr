import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { EventFormData } from '@/common/types/';
import { schema } from '../schemas/eventFormSchema';

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
