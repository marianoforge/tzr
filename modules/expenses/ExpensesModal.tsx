import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Input from '@/components/PrivateComponente/FormComponents/Input';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import Select from '@/components/PrivateComponente/FormComponents/Select'; // Reutilizamos Select
import { Expense } from '@/common/types/';
import { updateExpense } from '@/lib/api/expensesApi';
import { expenseTypes } from '@/lib/data';
import { schema } from '@/common/schemas/expensesModalSchema';
import { QueryKeys } from '@/common/enums';
import { useUserDataStore } from '@/stores/userDataStore';

type FormData = yup.InferType<typeof schema>;

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: (Expense & { id?: string }) | null;
  onExpenseUpdate: (updatedExpense: Expense & { id: string }) => void;
}

const ExpensesModal: React.FC<ExpensesModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  const queryClient = useQueryClient();
  const { userData } = useUserDataStore();
  const currency = userData?.currency;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: expense || {},
  });

  useEffect(() => {
    if (expense) {
      reset({
        ...expense,
        date: expense.date
          ? new Date(expense.date).toISOString().split('T')[0]
          : '',
      });
    }
  }, [expense, reset]);

  const mutation = useMutation({
    mutationFn: (updatedExpense: Expense) => updateExpense(updatedExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXPENSES] });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating expense:', error);
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!expense?.id) {
      console.error('Expense ID is missing');
      return;
    }

    mutation.mutate({
      ...data,
      id: expense.id,
      amountInDollars: data.amount / data.dollarRate,
      user_uid: expense.user_uid,
      otherType: data.otherType ?? '',
      isRecurring: data.isRecurring ?? false,
    });
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] md:w-[80%] lg:w-[70%] xl:w-[50%] 2xl:w-[30%] p-6 rounded-xl shadow-lg  font-bold h-auto flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Editar Gasto</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Fecha del Gasto"
            type="date"
            {...register('date')}
            error={errors.date?.message}
            required
          />

          <Input
            label="Monto"
            type="number"
            placeholder="Monto"
            step="any"
            {...register('amount')}
            error={errors.amount?.message}
            required
          />

          {currency === 'USD' && (
            <Input
              label="Cotización del dólar"
              type="number"
              placeholder="Cotización del dólar"
              step="any"
              {...register('dollarRate')}
              error={errors.dollarRate?.message}
              required
            />
          )}

          <Input
            label="Descripción"
            type="text"
            placeholder="Descripción"
            {...register('description')}
            error={errors.description?.message}
            required
          />

          <Select
            label="Tipo de Gasto"
            options={expenseTypes.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
            register={register}
            name="expenseType"
            error={errors.expenseType?.message}
            required
          />

          {watch('expenseType') === 'Otros' && (
            <Input
              label="Especifica el tipo de gasto"
              type="text"
              placeholder="Especifica el tipo de gasto"
              {...register('otherType')}
            />
          )}

          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="isRecurring"
              {...register('isRecurring')}
              className="h-5 w-5 text-mediumBlue rounded border-gray-300 focus:ring-mediumBlue"
            />
            <label htmlFor="isRecurring" className="ml-2 text-gray-700">
              Repetir Mensualmente
            </label>
            <div className="ml-2 cursor-help group relative">
              <span className="flex items-center justify-center w-5 h-5 bg-mediumBlue text-white rounded-full text-xs">
                ?
              </span>
              <div className="absolute hidden group-hover:block bg-black text-white text-xs rounded p-2 w-64 -ml-32 mt-2 z-10">
                Al activar esta opción, este gasto se repetirá automáticamente
                cada mes con los mismos datos.
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center items-center">
            <Button
              type="submit"
              className="bg-mediumBlue text-white p-2 rounded hover:bg-lightBlue transition-all duration-300 font-semibold w-[30%]"
            >
              Guardar
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-lightBlue text-white p-2 rounded hover:bg-mediumBlue transition-all duration-300 font-semibold w-[30%]"
            >
              Cerrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpensesModal;
