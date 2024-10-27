import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Input from '@/components/TrackerComponents/FormComponents/Input';
import Button from '@/components/TrackerComponents/FormComponents/Button';
import Select from '@/components/TrackerComponents/FormComponents/Select'; // Reutilizamos Select
import { Expense } from '@/types';
import { updateExpense } from '@/lib/api/expensesApi';
import { useUserDataStore } from '@/stores/userDataStore';

import { expenseTypes } from '@/lib/data';
import { schema } from '@/schemas/expensesModalSchema';

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

  const [expenseAssociationType, setExpenseAssociationType] = useState(
    expense?.expenseAssociationType || 'agent'
  );
  const { userData } = useUserDataStore();
  const userRole = userData?.role;

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
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
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
      expenseAssociationType: expenseAssociationType,
    });
  };

  if (!isOpen || !expense) return null;

  const handleAssociationTypeChange = (newType: string) => {
    setExpenseAssociationType(newType);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg  font-bold w-[50%] h-auto flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Editar Gasto</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {userRole === 'team_leader_broker' && (
            <Select
              label="Asociación del Gasto"
              options={[
                { value: '', label: 'Selecciona una opción' }, // Added default option
                {
                  value: 'team_broker',
                  label: 'Gasto Asociado al Team / Broker',
                },
                { value: 'agent', label: 'Gasto Asociado como Asesor' },
              ]}
              register={register}
              name="expenseAssociationType"
              className="w-full p-2 border"
              required
              onChange={(e) => handleAssociationTypeChange(e.target.value)}
            />
          )}

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

          <Input
            label="Cotización del dólar"
            type="number"
            placeholder="Cotización del dólar"
            step="any"
            {...register('dollarRate')}
            error={errors.dollarRate?.message}
            required
          />

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
