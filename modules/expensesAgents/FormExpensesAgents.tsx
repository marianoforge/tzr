import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import ModalOK from '@/components/PrivateComponente/CommonComponents/Modal';
import Input from '@/components/PrivateComponente/FormComponents/Input';
import TextArea from '@/components/PrivateComponente/FormComponents/TextArea';
import Select from '@/components/PrivateComponente/FormComponents/Select';
import { Expense, ExpenseAgentsFormData, TeamMember } from '@/common/types/';
import { useUserDataStore } from '@/stores/userDataStore';
import { schema } from '@/common/schemas/formAgentsExpensesSchema';
import useUserAuth from '@/common/hooks/useUserAuth';
import useModal from '@/common/hooks/useModal';
import { useTeamMembers } from '@/common/hooks/useTeamMembers';
import { useAddExpenseToAgent } from '@/common/hooks/useAddExpenseToAgent';

const FormExpensesAgents: React.FC = () => {
  const userID = useUserAuth();
  const { userData } = useUserDataStore();
  const router = useRouter();

  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [modalMessage, setModalMessage] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  const role = userData?.role;

  const { data: teamMembers, isLoading: isTeamMembersLoading } =
    useTeamMembers();

  useEffect(() => {
    if (userID) {
      setUserRole(role ?? null);
    }
  }, [role, userID]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ExpenseAgentsFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: '',
    },
  });

  const amount = watch('amount');
  const dollarRate = watch('dollarRate');
  const date = watch('date');

  const addExpenseToAgent = useAddExpenseToAgent(() => {
    setModalMessage('Gasto agregado al agente exitosamente');
    openModal();
    reset();
  });

  const onSubmit: SubmitHandler<ExpenseAgentsFormData> = (
    data: ExpenseAgentsFormData
  ) => {
    if (!userID) {
      setModalMessage('No se proporcionó un ID de usuario válido');
      openModal();
      return;
    }

    const amountInDollars =
      data.amount && data.dollarRate ? data.amount / data.dollarRate : 0;

    const expenseData: Expense = {
      date: data.date,
      amount: data.amount ?? 0,
      amountInDollars,
      otherType: data.otherType ?? '',
      expenseType: data.expenseType,
      description: data.description ?? '',
      dollarRate: data.dollarRate,
    };

    addExpenseToAgent.mutate({
      agentId: data.teamMember,
      expense: expenseData,
    });
  };

  const amountInDollars =
    amount && dollarRate ? (amount / dollarRate).toFixed(2) : 0;

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
          />
          {errors.amount && (
            <p className="text-red-500 mb-4 -mt-8">{errors.amount.message}</p>
          )}

          <div className="flex gap-4 items-center">
            <div className="w-1/2">
              <Input
                label="Cotización del Dólar"
                type="number"
                placeholder="1250"
                {...register('dollarRate')}
                marginBottom="mb-8"
              />
              {errors.dollarRate && (
                <p className="text-red-500 mb-4 -mt-8">
                  {errors.dollarRate.message}
                </p>
              )}
            </div>
            <div className="w-1/2 ">
              <Input
                label="Monto en Dólares"
                type="text"
                value={amountInDollars}
                readOnly
                className="bg-mutedBlue/80 border text-white border-mutedBlue cursor-not-allowed p-2 rounded mb-2"
              />
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-1/2">
              {isTeamMembersLoading ? (
                <p>Loading team members...</p>
              ) : (
                <Select
                  label="Asignado a"
                  options={teamMembers?.map((member: TeamMember) => ({
                    value: member.id,
                    label: member.firstName + ' ' + member.lastName,
                  }))}
                  register={register}
                  name="teamMember"
                  mb="mb-8"
                />
              )}
              {errors.teamMember && (
                <p className="text-red-500 mb-4 -mt-8">
                  {errors.teamMember.message}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <Input
                label="Tipo de Gasto"
                type="text"
                placeholder="Pasaje a Asunción"
                {...register('expenseType')}
                marginBottom="mb-8"
              />
              {errors.expenseType && (
                <p className="text-red-500 mb-4 -mt-8">
                  {errors.expenseType.message}
                </p>
              )}
            </div>
          </div>
          <TextArea
            label="Descripción"
            {...register('description')}
            error={errors.description?.message}
          />
          {errors.description && (
            <p className="text-red-500 -mt-8">{errors.description.message}</p>
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
        onClose={closeModal}
        message={modalMessage}
        onAccept={() => router.push('/expenses-agents-form')}
      />
    </div>
  );
};

export default FormExpensesAgents;
