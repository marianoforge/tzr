import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import ModalOK from '@/components/PrivateComponente/CommonComponents/Modal';
import Input from '@/components/PrivateComponente/FormComponents/Input';
import TextArea from '@/components/PrivateComponente/FormComponents/TextArea';
import Select from '@/components/PrivateComponente/FormComponents/Select';
import { Expense, ExpenseFormData } from '@/common/types/';
import { useUserDataStore } from '@/stores/userDataStore';
import { createExpense } from '@/lib/api/expensesApi';
import { getSchema } from '@/common/schemas/formExpensesSchema';
import { expenseTypes } from '@/lib/data';
import useUserAuth from '@/common/hooks/useUserAuth';
import useModal from '@/common/hooks/useModal';
import { QueryKeys } from '@/common/enums';

const FormularioExpenses: React.FC = () => {
  const userID = useUserAuth();
  const { userData } = useUserDataStore();
  const router = useRouter();

  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [modalMessage, setModalMessage] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCurrency, setUserCurrency] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const role = userData?.role;
  const currency = userData?.currency;

  useEffect(() => {
    if (userID) {
      setUserRole(role ?? null);
      setUserCurrency(currency ?? null);
    }
  }, [role, userID, currency]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(getSchema(userCurrency)),
    defaultValues: {
      date: '',
      isRecurring: false,
    },
  });

  const selectedExpenseType = watch('expenseType');
  const date = watch('date');
  const amount = watch('amount');
  const dollarRate = watch('dollarRate');

  // Calcular el monto en dólares cada vez que cambia el monto o la cotización
  const amountInDollars = React.useMemo(() => {
    // Convertir a números y manejar valores undefined/null
    const numAmount = amount ? Number(amount) : 0;
    const numDollarRate = dollarRate ? Number(dollarRate) : 1;

    // Si no hay monto o tasa de cambio válida, mostrar 0
    if (numAmount === 0 || numDollarRate <= 0) return '0';

    // Calcular el monto en dólares (dividir por la tasa de cambio)
    return (numAmount / numDollarRate).toFixed(2);
  }, [amount, dollarRate]);

  const mutation = useMutation({
    mutationFn: (expenseData: Expense) => createExpense(expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXPENSES] });
      setModalMessage('Gasto guardado exitosamente');
      openModal();
      reset();
    },
    onError: (error) => {
      const axiosError = error as AxiosError;
      console.error(
        'Mutation error:',
        axiosError.response?.data || axiosError.message
      );
    },
  });

  const onSubmit: SubmitHandler<ExpenseFormData> = (data: ExpenseFormData) => {
    if (!userID) {
      setModalMessage('No se proporcionó un ID de usuario válido');
      openModal();
      return;
    }

    // Asegurarse de que tenemos valores numéricos válidos
    const numAmount = data.amount ? Number(data.amount) : 0;
    const numDollarRate = data.dollarRate ? Number(data.dollarRate) : 1;

    // Calcular el monto en dólares de la misma manera que en la UI
    const calculatedAmountInDollars =
      numAmount > 0 && numDollarRate > 0 ? numAmount / numDollarRate : 0;

    const expenseData: Expense = {
      date: data.date,
      amount: numAmount,
      amountInDollars: calculatedAmountInDollars,
      otherType: data.otherType ?? '',
      expenseType: data.expenseType,
      description: data.description ?? '',
      dollarRate: numDollarRate,
      user_uid: userID ?? '',
      isRecurring: data.isRecurring ?? false,
    };

    mutation.mutate(expenseData);
  };

  return (
    <div className="flex flex-col justify-center items-center mt-20">
      {userRole ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 bg-white rounded-lg shadow-md w-full xl:w-[80%] 2xl:w-[70%] "
        >
          <h2 className="text-2xl mb-4 font-semibold">Registrar Gasto</h2>

          <Input
            label="Fecha del Gasto"
            type="date"
            defaultValue={date}
            {...register('date')}
            marginBottom="mb-8"
          />
          {errors.date && (
            <p className="text-red-500 mb-4 -mt-8">{errors.date.message}</p>
          )}

          <Input
            label="Monto"
            type="number"
            placeholder="1000000"
            {...register('amount')}
            marginBottom="mb-8"
            showTooltip={true}
            tooltipContent="Ingrese el monto total del gasto en moneda Local"
          />
          {errors.amount && (
            <p className="text-red-500 mb-4 -mt-8">{errors.amount.message}</p>
          )}

          {userCurrency === 'USD' && (
            <div className="flex gap-4 items-center">
              <div className="w-1/2">
                <Input
                  label="Cotización del Dólar"
                  type="number"
                  placeholder="1250"
                  {...register('dollarRate')}
                  marginBottom="mb-8"
                  showTooltip={true}
                  tooltipContent="Ingrese la cotización del dólar en el momento del gasto si sus gastos estan en moneda local y las operaciones en dolares. Si sus gastos estan en dolares, solo ponga 1"
                />
                {errors.dollarRate && (
                  <p className="text-red-500 mb-4 -mt-8">
                    {errors.dollarRate.message}
                  </p>
                )}
              </div>

              <div className="w-1/2">
                <Input
                  label="Monto en Dólares"
                  type="text"
                  value={amountInDollars}
                  readOnly
                  className="bg-mutedBlue/80 border text-white border-mutedBlue cursor-not-allowed p-2 rounded mb-2"
                />
              </div>
            </div>
          )}

          <Select
            label="Tipo de Gasto"
            options={expenseTypes}
            register={register}
            name="expenseType"
            mb="mb-8"
          />
          {errors.expenseType && (
            <p className="text-red-500 mb-4 -mt-8">
              {errors.expenseType.message}
            </p>
          )}

          {selectedExpenseType === 'Otros' && (
            <Input
              label="Especifica el tipo de gasto"
              type="text"
              {...register('otherType')}
              error={errors.otherType?.message}
            />
          )}
          {errors.otherType && (
            <p className="text-red-500 -mt-8">{errors.otherType.message}</p>
          )}

          <TextArea
            label="Descripción"
            {...register('description')}
            error={errors.description?.message}
          />
          {errors.description && (
            <p className="text-red-500 -mt-8">{errors.description.message}</p>
          )}

          <div className="flex items-center mb-8 mt-4">
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

          <div className="flex justify-center items-center mt-8 w-full">
            <button
              type="submit"
              className="text-white p-2 rounded bg-mediumBlue hover:bg-lightBlue transition-all duration-300 font-semibold w-[200px]"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      ) : (
        <p>Loading...</p>
      )}
      <ModalOK
        isOpen={isModalOpen}
        onClose={closeModal}
        message={modalMessage}
        onAccept={() => router.push('/expenses')}
      />
    </div>
  );
};

export default FormularioExpenses;
