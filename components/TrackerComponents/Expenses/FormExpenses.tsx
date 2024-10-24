import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import ModalOK from '@/components/TrackerComponents/ModalOK';
import { useAuthStore } from '@/stores/authStore';
import Input from '@/components/TrackerComponents/FormComponents/Input';
import TextArea from '@/components/TrackerComponents/FormComponents/TextArea';
import Select from '@/components/TrackerComponents/FormComponents/Select';
import { Expense, ExpenseFormData } from '@/types';
import { useUserDataStore } from '@/stores/userDataStore';
import { createExpense } from '@/lib/api/expensesApi';

// Tipos de gastos
export const expenseTypes = [
  { value: 'Fee (Franquicia)', label: 'Fee (Franquicia)' },
  { value: 'Carteleria', label: 'Carteleria' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Varios', label: 'Varios' },
  { value: 'Contador', label: 'Contador' },
  { value: 'Matricula', label: 'Matricula' },
  { value: 'ABAO', label: 'ABAO' },
  { value: 'Fianza', label: 'Fianza' },
  { value: 'Alquiler Oficina', label: 'Alquiler Oficina' },
  { value: 'Portales Inmobiliarios', label: 'Portales Inmobiliarios' },
  { value: 'CRM', label: 'CRM' },
  { value: 'Viaticos', label: 'Viaticos' },
  { value: 'Expensas', label: 'Expensas' },
  { value: 'Otros', label: 'Otros' },
];

const FormularioExpenses: React.FC = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [expenseAssociationType, setExpenseAssociationType] = useState('agent');
  const [userRole, setUserRole] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const role = userData?.role;

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setUserRole(role ?? null);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setModalMessage('Error fetching user role');
        setIsModalOpen(true);
      }
    };
    if (userID) {
      fetchUserRole();
    }
  }, [userID]);

  const schema = yup.object().shape({
    expenseType: yup.string().required(),
    date: yup.string().required('La fecha es requerida'),
    amount: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue.trim() === '' ? undefined : value;
      })
      .required('El monto es requerido')
      .positive('El monto debe ser un número positivo'),
    dollarRate: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue.trim() === '' ? undefined : value;
      })
      .positive('La cotización del dólar debe ser un número positivo')
      .required('La cotización del dólar es requerida'),
    description: yup.string(),
    otherType: yup
      .string()
      .when('expenseType', ([expenseType], schema: yup.StringSchema) => {
        return expenseType === 'Otros'
          ? schema.required('Debes especificar el tipo de gasto')
          : schema;
      }),
    expenseAssociationType: yup
      .string()
      .required('Debes seleccionar una asociación de gasto')
      .notOneOf([''], 'Debes seleccionar una opción válida'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: '', // Set a default value for the date field
    },
  });

  const selectedExpenseType = watch('expenseType');
  const amount = watch('amount');
  const dollarRate = watch('dollarRate');
  const date = watch('date');

  const mutation = useMutation({
    mutationFn: (expenseData: Expense) => createExpense(expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setModalMessage('Gasto guardado exitosamente');
      setIsModalOpen(true);
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

  const onSubmit: SubmitHandler<ExpenseFormData> = (data) => {
    if (!userID) {
      setModalMessage('No se proporcionó un ID de usuario válido');
      setIsModalOpen(true);
      return;
    }

    // No convertir la fecha a un objeto Date, guardarla tal como está (cadena)
    const amountInDollars =
      data.amount && data.dollarRate ? data.amount / data.dollarRate : 0;

    const expenseData: Expense = {
      date: data.date, // Guardamos la fecha tal cual, sin conversión a Date
      amount: data.amount ?? 0,
      amountInDollars,
      otherType: data.otherType ?? '',
      expenseType: data.expenseType,
      description: data.description ?? '',
      dollarRate: data.dollarRate,
      user_uid: userID ?? '',
      expenseAssociationType,
    };

    mutation.mutate(expenseData);
  };

  const amountInDollars =
    amount && dollarRate ? (amount / dollarRate).toFixed(2) : 0;

  const handleAssociationTypeChange = (newType: string) => {
    setExpenseAssociationType(newType);
  };

  return (
    <div className="flex flex-col justify-center items-center mt-20">
      {userRole ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 bg-white rounded-lg shadow-md w-full xl:w-[80%] 2xl:w-[70%] "
        >
          <h2 className="text-2xl mb-4 font-semibold">Registrar Gasto</h2>

          {userRole === 'team_leader_broker' && (
            <div>
              <Select
                label="Asociación del Gasto"
                options={[
                  { value: '', label: 'Selecciona una opción' },
                  {
                    value: 'team_broker',
                    label: 'Gasto Asociado al Team / Broker',
                  },
                  { value: 'agent', label: 'Gasto Asociado como Asesor' },
                ]}
                register={register}
                name="expenseAssociationType"
                className="w-full p-2 border mb-[8px]"
                onChange={(e) => handleAssociationTypeChange(e.target.value)}
              />
              {errors.expenseAssociationType && (
                <p className="text-red-500 mb-4">
                  {errors.expenseAssociationType.message}
                </p>
              )}
            </div>
          )}

          <Input
            label="Fecha del Gasto"
            type="date"
            defaultValue={date} // Mostramos la fecha como cadena
            {...register('date')}
            marginBottom="0"
          />
          {errors.date && (
            <p className="text-red-500 mb-4">{errors.date.message}</p>
          )}

          <Input
            label="Monto"
            type="number"
            placeholder="1000000"
            {...register('amount')}
            marginBottom="0"
          />
          {errors.amount && (
            <p className="text-red-500 mb-4">{errors.amount.message}</p>
          )}

          <div className="flex gap-4 items-center">
            <div className="w-1/2">
              <Input
                label="Cotización del Dólar"
                type="number"
                placeholder="1250"
                {...register('dollarRate')}
                marginBottom="0"
              />
              {errors.dollarRate && (
                <p className="text-red-500 mb-4">{errors.dollarRate.message}</p>
              )}
            </div>
            <div className="w-1/2 ">
              <Input
                label="Monto en Dólares"
                type="text"
                value={amountInDollars}
                readOnly
                className="bg-gray-100 cursor-not-allowed p-2 rounded-lg"
              />
            </div>
          </div>

          <Select
            label="Tipo de Gasto"
            options={expenseTypes}
            register={register}
            name="expenseType"
            mb="mb-4"
          />
          {errors.expenseType && (
            <p className="text-red-500 mb-4">{errors.expenseType.message}</p>
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
            <p className="text-red-500">{errors.otherType.message}</p>
          )}

          <TextArea
            label="Descripción"
            {...register('description')}
            error={errors.description?.message}
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}

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
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
        onAccept={() => router.push('/expenses')}
      />
    </div>
  );
};

export default FormularioExpenses;
