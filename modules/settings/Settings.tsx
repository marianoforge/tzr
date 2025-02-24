/* eslint-disable import/no-duplicates */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import router from 'next/router';

import { useAuthStore } from '@/stores/authStore';
import { cleanString } from '@/common/utils/cleanString';
import { formatNumber } from '@/common/utils/formatNumber';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import ModalCancel from '@/components/PrivateComponente/CommonComponents/Modal';
import ModalUpdate from '@/components/PrivateComponente/CommonComponents/Modal';
import { QueryKeys } from '@/common/enums';

const Settings = () => {
  const { userID } = useAuthStore();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agenciaBroker, setAgenciaBroker] = useState('');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [objetivoAnual, setObjetivoAnual] = useState(0);
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState({
    firstName: false,
    lastName: false,
    password: false,
    agenciaBroker: false,
    numeroTelefono: false,
    objetivoAnual: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [openModalCancel, setOpenModalCancel] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);

  const { data: userDataQuery, isLoading: isLoadingQuery } = useQuery({
    queryKey: ['userData', userID],
    queryFn: async () => {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error('User not authenticated');

      const response = await axios.get(`/api/users/${userID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!userID,
  });

  useEffect(() => {
    setSubscriptionId(
      userDataQuery?.stripeSubscriptionId ?? 'No Subscription ID'
    );
  }, [userDataQuery]);

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: [QueryKeys.SUBSCRIPTION_DATA, userID],
    queryFn: async () => {
      if (!subscriptionId) throw new Error('No Subscription ID');

      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error('User not authenticated');

      const response = await axios.get(
        `/api/stripe/subscription_info?subscription_id=${subscriptionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // 🔹 Aquí agregamos el token correctamente
        }
      );

      return response.data;
    },
    enabled: !!userID && !!subscriptionId,
  });

  useEffect(() => {
    if (userDataQuery) {
      setFirstName(userDataQuery.firstName);
      setLastName(userDataQuery.lastName);
      setAgenciaBroker(userDataQuery.agenciaBroker);
      setNumeroTelefono(userDataQuery.numeroTelefono);
      setObjetivoAnual(
        userDataQuery.objetivoAnual ?? 'Objetivo anual no definido'
      );
    }
  }, [userDataQuery]);

  const handleCancelSubscription = async () => {
    if (!subscriptionId) return;

    try {
      setIsCanceling(true);
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error('User not authenticated');

      const response = await axios.post(
        '/api/stripe/cancel_subscription',
        {
          subscription_id: subscriptionId,
          user_id: userID,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setCancelMessage('Suscripción cancelada exitosamente.');

        await axios.put(
          `/api/users/${userID}`,
          {
            stripeSubscriptionId: null,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        queryClient.invalidateQueries({ queryKey: ['userData', userID] });
      } else {
        setCancelMessage('No se pudo cancelar la suscripción.');
      }
    } catch (error) {
      console.error('Error al cancelar la suscripción:', error);
      setCancelMessage('Error al cancelar la suscripción.');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error('User not authenticated');

      const response = await axios.put(
        `/api/users/${userID}`,
        {
          firstName: firstName,
          lastName: lastName,
          agenciaBroker: cleanString(agenciaBroker),
          numeroTelefono: cleanString(numeroTelefono),
          objetivoAnual,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setOpenModalUpdate(true);
        setSuccess('Datos actualizados correctamente');
        queryClient.invalidateQueries({ queryKey: ['userData', userID] });
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      setErrorMessage('Error al actualizar los datos');
    }
  };

  const toggleEditMode = (field: keyof typeof editMode) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = (field: keyof typeof editMode) => {
    toggleEditMode(field);
  };

  if (isLoading || isLoadingQuery) {
    return <SkeletonLoader height={760} count={1} />;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {isLoadingQuery ? (
        <p>Loading...</p>
      ) : (
        <form
          onSubmit={handleUpdate}
          className="bg-white p-4 sm:p-6 md:p-8 mt-10 rounded-xl shadow-md w-full"
        >
          <h2 className="text-xl sm:text-2xl mb-4 text-center font-semibold">
            Datos Personales
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 w-full mt-6">
            <div className="mb-4 flex w-full sm:w-1/2 gap-2 justify-center sm:justify-end">
              <input
                type="text"
                placeholder="Nombre"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 mb-2 border border-gray-300 rounded"
                disabled={!editMode.firstName}
                required
              />
              <button
                type="button"
                onClick={() =>
                  editMode.firstName
                    ? handleSave('firstName')
                    : toggleEditMode('firstName')
                }
                className="bg-lightBlue text-white px-2 h-[40px] rounded hover:bg-mediumBlue w-[75px]"
              >
                {editMode.firstName ? 'Guardar' : 'Editar'}
              </button>
            </div>

            <div className="mb-4 flex w-full sm:w-1/2 gap-2 justify-center sm:justify-start">
              <input
                type="text"
                placeholder="Apellido"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 mb-2 border border-gray-300 rounded"
                disabled={!editMode.lastName}
                required
              />
              <button
                type="button"
                onClick={() =>
                  editMode.lastName
                    ? handleSave('lastName')
                    : toggleEditMode('lastName')
                }
                className="bg-lightBlue text-white px-2 h-[40px] rounded hover:bg-mediumBlue w-[75px]"
              >
                {editMode.lastName ? 'Guardar' : 'Editar'}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 w-full">
            <div className="mb-4 flex w-full sm:w-1/2 gap-2 justify-center sm:justify-end">
              <input
                type="text"
                placeholder="Agencia o Broker"
                name="agenciaBroker"
                value={agenciaBroker}
                onChange={(e) => setAgenciaBroker(e.target.value)}
                className="w-full p-2 mb-2 border border-gray-300 rounded"
                disabled={!editMode.agenciaBroker}
                required
              />
              <button
                type="button"
                onClick={() =>
                  editMode.agenciaBroker
                    ? handleSave('agenciaBroker')
                    : toggleEditMode('agenciaBroker')
                }
                className="bg-lightBlue text-white px-2 h-[40px] rounded hover:bg-mediumBlue w-[75px]"
              >
                {editMode.agenciaBroker ? 'Guardar' : 'Editar'}
              </button>
            </div>

            <div className="mb-4 flex w-full sm:w-1/2 gap-2 justify-center sm:justify-start">
              <input
                type="tel"
                placeholder="Número de Teléfono"
                name="numeroTelefono"
                value={numeroTelefono}
                onChange={(e) => setNumeroTelefono(e.target.value)}
                className="w-full p-2 mb-2 border border-gray-300 rounded"
                disabled={!editMode.numeroTelefono}
                required
              />
              <button
                type="button"
                onClick={() =>
                  editMode.numeroTelefono
                    ? handleSave('numeroTelefono')
                    : toggleEditMode('numeroTelefono')
                }
                className="bg-lightBlue text-white px-2 h-[40px] rounded hover:bg-mediumBlue w-[75px]"
              >
                {editMode.numeroTelefono ? 'Guardar' : 'Editar'}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row w-full">
            <div className="mb-4 flex w-full sm:w-1/2 gap-2 justify-center sm:justify-end pr-5">
              <input
                type="text"
                placeholder="Objetivo de Anual de Ventas"
                name="objetivoAnual"
                value={`${formatNumber(objetivoAnual) ?? 'Objetivo anual no definido'}`}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setObjetivoAnual(Number(value) || 0);
                }}
                className="w-full p-2 mb-2 border border-gray-300 rounded"
                disabled={!editMode.objetivoAnual}
                required
              />
              <button
                type="button"
                onClick={() =>
                  editMode.objetivoAnual
                    ? handleSave('objetivoAnual')
                    : toggleEditMode('objetivoAnual')
                }
                className="bg-lightBlue text-white px-2 h-[40px] rounded hover:bg-mediumBlue w-[75px]"
              >
                {editMode.objetivoAnual ? 'Guardar' : 'Editar'}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-end w-full mt-6">
            <button
              type="submit"
              className="w-full sm:w-[200px] bg-mediumBlue text-white p-2 rounded hover:bg-lightBlue"
            >
              Actualizar
            </button>
          </div>
        </form>
      )}

      {/* SUBSCRIPTION */}
      <div className="bg-white p-4 sm:p-6 md:p-8 mt-10 rounded-xl shadow-md w-full">
        <h3 className="text-xl sm:text-2xl font-semibold text-center">
          Suscripción
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-20 justify-center items-center">
          <div className="flex flex-col gap-2 justify-center items-center">
            <ul className="mb-8 mt-4 font-semibold text-md flex flex-col gap-2 text-mediumBlue border-dashed border-2 border-mediumBlue rounded-lg p-4 w-full sm:w-[400px]">
              <li>
                Plan Activo:{' '}
                {subscriptionData?.plan?.active ? (
                  <span className="text-greenAccent font-semibold">Sí</span>
                ) : (
                  <span className="text-red-500">No</span>
                )}
              </li>
              <li>
                Monto del Plan: ${subscriptionData?.plan?.amount_decimal / 100}{' '}
                (USD)
              </li>
              <li>
                Intervalo del Plan:{' '}
                {subscriptionData?.plan?.interval === 'month'
                  ? 'Mensual'
                  : 'Anual'}
              </li>
              <li>
                Estado:{' '}
                {subscriptionData?.status === 'trialing'
                  ? 'Periodo de Prueba'
                  : 'Activo'}
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <button
              onClick={() => setOpenModalCancel(true)}
              className={`px-4 py-2 rounded w-full sm:w-[200px] ${
                subscriptionId
                  ? 'bg-lightBlue text-white hover:bg-mediumBlue'
                  : 'bg-mutedBlue text-white cursor-not-allowed'
              }`}
              disabled={!subscriptionId || isCanceling}
            >
              {isCanceling ? 'Cancelando...' : 'Cancelar suscripción'}
            </button>
            {cancelMessage && <p className="mt-4">{cancelMessage}</p>}
          </div>
        </div>
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>}

      <ModalCancel
        isOpen={openModalCancel}
        onClose={() => setOpenModalCancel(false)}
        onAccept={() => {
          setOpenModalCancel(false);
        }}
        message="Desde que cancelas la suscripción, no podrás acceder a Realtor Trackpro"
        secondButtonText="Cancelar Suscripción"
        onSecondButtonClick={() => {
          setOpenModalCancel(false);
          handleCancelSubscription();
          router.push('/');
        }}
        className="w-full sm:w-[760px]"
      />

      <ModalUpdate
        isOpen={openModalUpdate}
        onClose={() => setOpenModalUpdate(false)}
        onAccept={() => {
          setOpenModalUpdate(false);
        }}
        message={errorMessage ? errorMessage : success}
        className="w-full sm:w-[760px]"
      />
    </div>
  );
};

export default Settings;
