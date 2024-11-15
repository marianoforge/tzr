import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { schema } from '../schemas/eventFormSchema';

import { EventFormData } from '@/common/types/';

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
