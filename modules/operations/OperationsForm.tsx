import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InferType } from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BuildingOffice2Icon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import Button from '@/components/PrivateComponente/FormComponents/Button';
import Input from '@/components/PrivateComponente/FormComponents/Input';
import { auth } from '@/lib/firebase';
import { createOperation } from '@/lib/api/operationsApi';
import { calculateHonorarios } from '@/common/utils/calculations';
import { schema } from '@/common/schemas/operationsFormSchema';
import { Operation, TeamMember } from '@/common/types/';
import { useUserDataStore } from '@/stores/userDataStore';
import { useTeamMembers } from '@/common/hooks/useTeamMembers';
import Select from '@/components/PrivateComponente/FormComponents/Select';
import { formatDateForUser } from '@/common/utils/formatDateForUser';
import ModalOK from '@/components/PrivateComponente/CommonComponents/Modal';
import { operationTypes, propertyTypes } from '@/lib/data';
import { PATHS, QueryKeys, UserRole } from '@/common/enums';
import TextArea from '@/components/PrivateComponente/FormComponents/TextArea';
import AddressAutocompleteManual from '@/components/PrivateComponente/PlacesComponents/AddressAutocomplete';
import AddUserModal from '@/modules/agents/AddUserModal';

type FormData = InferType<typeof schema>;
type AddressData = {
  address: string;
  city: string | null;
  province: string | null;
  country: string | null;
  houseNumber: string;
};

// Componente Toast
const Toast: React.FC<{
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}> = ({ type, message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(
        () => {
          onClose();
        },
        type === 'error' ? 4000 : 3000
      );
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, type]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] max-w-md">
      <div
        className={`
          transform transition-all duration-500 ease-in-out
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          ${
            type === 'success'
              ? 'bg-green-50 border-l-4 border-green-400'
              : 'bg-red-50 border-l-4 border-red-400'
          }
          p-4 rounded-lg shadow-lg border
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            ) : (
              <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p
              className={`text-sm font-medium ${
                type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {message}
            </p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`
                inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  type === 'success'
                    ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                    : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                }
              `}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OperationsForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      estado: 'En Curso',
      punta_compradora: false,
      punta_vendedora: false,
      fecha_operacion: '',
      direccion_reserva: '',
      reparticion_honorarios_asesor: 0,
      localidad_reserva: null,
      provincia_reserva: null,
      exclusiva: false,
      no_exclusiva: false,
      realizador_venta: null,
      realizador_venta_adicional: null,
      porcentaje_honorarios_asesor: null,
      porcentaje_honorarios_asesor_adicional: null,
      gastos_operacion: null,
    },
  });

  const { data: teamMembers } = useTeamMembers();
  const [userUID, setUserUID] = useState<string | null>(null);
  const { userData } = useUserDataStore();
  const [userTimeZone, setUserTimeZone] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage] = useState('');
  const [honorariosBroker, setHonorariosBroker] = useState(0);
  const [honorariosAsesor, setHonorariosAsesor] = useState(0);
  const [porcentajeHonorariosBroker, setPorcentajeHonorariosBroker] =
    useState(0);
  const [showAdditionalAdvisor, setShowAdditionalAdvisor] = useState(false);
  const [addressData, setAddressData] = useState<AddressData>({
    address: '',
    city: null,
    province: null,
    country: null,
    houseNumber: '',
  });
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Estados para toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const router = useRouter();
  const queryClient = useQueryClient();
  const userRole = userData?.role;

  const usersMapped = [
    ...(teamMembers?.map((member: TeamMember) => ({
      name: `${member.firstName} ${member.lastName}`,
      uid: member.id,
    })) || []),
    ...(userUID
      ? [
          {
            name:
              `${userData?.firstName} ${userData?.lastName}` || 'Logged User',
            uid: userUID,
          },
        ]
      : []),
  ];

  // Detectar si el Team Leader está seleccionado como asesor
  const currentUserName =
    `${userData?.firstName} ${userData?.lastName}` || 'Logged User';
  const isTeamLeaderPrimaryAdvisor =
    watch('realizador_venta') === currentUserName;
  const isTeamLeaderAdditionalAdvisor =
    watch('realizador_venta_adicional') === currentUserName;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUID(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimeZone(timeZone);
  }, []);

  const watchAllFields = watch();

  const date = watch('fecha_operacion');

  const formattedDate = date ? formatDateForUser(date, userTimeZone) : '';

  useEffect(() => {
    const valor_reserva = parseFloat(String(watchAllFields.valor_reserva)) || 0;
    const porcentaje_honorarios_asesor =
      parseFloat(String(watchAllFields.porcentaje_honorarios_asesor)) || 0;
    const porcentaje_punta_compradora =
      parseFloat(String(watchAllFields.porcentaje_punta_compradora)) || 0;
    const porcentaje_punta_vendedora =
      parseFloat(String(watchAllFields.porcentaje_punta_vendedora)) || 0;
    const porcentaje_compartido =
      parseFloat(String(watchAllFields.porcentaje_compartido)) || 0;
    const porcentaje_referido =
      parseFloat(String(watchAllFields.porcentaje_referido)) || 0;

    const { honorariosBroker, honorariosAsesor } = calculateHonorarios(
      valor_reserva,
      porcentaje_honorarios_asesor,
      porcentajeHonorariosBroker,
      porcentaje_compartido,
      porcentaje_referido
    );

    setHonorariosBroker(honorariosBroker);
    setHonorariosAsesor(honorariosAsesor);
    setPorcentajeHonorariosBroker(
      porcentaje_punta_compradora + porcentaje_punta_vendedora
    );
  }, [
    watchAllFields.valor_reserva,
    watchAllFields.porcentaje_honorarios_asesor,
    watchAllFields.porcentaje_punta_compradora,
    watchAllFields.porcentaje_punta_vendedora,
    porcentajeHonorariosBroker,
    watchAllFields.porcentaje_compartido,
    watchAllFields.porcentaje_referido,
  ]);

  const mutation = useMutation({
    mutationFn: createOperation,
    onSuccess: () => {
      if (userUID) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.OPERATIONS, userUID],
        });
      }
      showToast('success', 'Operación guardada exitosamente');
      reset();
      setTimeout(() => {
        router.push(PATHS.DASHBOARD);
      }, 2000);
    },
    onError: (error: Error & { response?: { status?: number } }) => {
      console.error('Error creating operation:', error);

      let errorMessage = 'Error al guardar la operación';
      if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos. Verifica la información ingresada';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Inténtalo más tarde';
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast('error', errorMessage);
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Validaciones adicionales
    if (!data.fecha_reserva) {
      showToast('error', 'La fecha de reserva es obligatoria');
      return;
    }

    if (!data.valor_reserva || data.valor_reserva <= 0) {
      showToast(
        'error',
        'El valor de reserva es obligatorio y debe ser mayor a 0'
      );
      return;
    }

    if (!data.tipo_operacion) {
      showToast('error', 'Debe seleccionar el tipo de operación');
      return;
    }

    if (!data.exclusiva && !data.no_exclusiva) {
      showToast(
        'error',
        'Debe seleccionar el tipo de exclusividad de la operación'
      );
      return;
    }

    if (!addressData.address.trim()) {
      showToast('error', 'La dirección es obligatoria');
      return;
    }

    if (!userUID) {
      showToast('error', 'Usuario no autenticado. Por favor, inicia sesión.');
      return;
    }

    const selectedUser = usersMapped.find(
      (member: { name: string }) => member.name === data.realizador_venta
    );

    const assignedUserUID =
      selectedUser && selectedUser.uid !== userUID ? selectedUser.uid : userUID;

    const selectedUserAdicional = usersMapped.find(
      (member: { name: string }) =>
        member.name === data.realizador_venta_adicional
    );

    const assignedUserUIDAdicional =
      selectedUserAdicional && selectedUserAdicional.uid !== userUID
        ? selectedUserAdicional.uid
        : '';

    const dataToSubmit = {
      ...data,
      direccion_reserva: addressData.address,
      numero_casa: addressData.houseNumber,
      localidad_reserva: addressData.city,
      provincia_reserva: addressData.province,
      pais: addressData.country,
      fecha_operacion: data.fecha_operacion,
      honorarios_broker: honorariosBroker,
      honorarios_asesor: honorariosAsesor,
      user_uid: assignedUserUID,
      user_uid_adicional: assignedUserUIDAdicional,
      teamId: userUID,
      punta_compradora: data.punta_compradora ? 1 : 0,
      punta_vendedora: data.punta_vendedora ? 1 : 0,
      exclusiva: data.exclusiva ? true : false,
      no_exclusiva: data.no_exclusiva ? true : false,
      estado: 'En Curso',
      porcentaje_punta_compradora: data.porcentaje_punta_compradora || 0,
      porcentaje_punta_vendedora: data.porcentaje_punta_vendedora || 0,
      porcentaje_honorarios_broker: porcentajeHonorariosBroker,
      reparticion_honorarios_asesor: data.reparticion_honorarios_asesor || 0,
      tipo_inmueble: data.tipo_inmueble,
      gastos_operacion: data.gastos_operacion || 0,
    };

    mutation.mutate(dataToSubmit as unknown as Operation);
  };

  const handleModalAccept = () => {
    router.push(PATHS.DASHBOARD);
  };

  const toggleAdditionalAdvisor = () => {
    setShowAdditionalAdvisor((prev) => !prev);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header profesional y moderno */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-[#0077b6] to-[#023e8a] px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BuildingOffice2Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Agregar Reserva / Operación
                  </h1>
                  <p className="text-blue-100">
                    Registra una nueva operación inmobiliaria en el sistema
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sección 1: Información General */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <DocumentTextIcon className="w-5 h-5 text-[#0077b6]" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      1. Información General
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="Fecha de Captación / Publicación"
                      type="date"
                      defaultValue={formattedDate}
                      {...register('fecha_captacion')}
                      error={errors.fecha_captacion?.message}
                      className="w-full"
                    />

                    <Input
                      label="Fecha de Reserva*"
                      type="date"
                      defaultValue={formattedDate}
                      {...register('fecha_reserva')}
                      error={errors.fecha_reserva?.message}
                      required
                      className="w-full"
                    />

                    <Input
                      label="Fecha de Cierre"
                      type="date"
                      defaultValue={formattedDate}
                      {...register('fecha_operacion')}
                      error={errors.fecha_operacion?.message}
                      className="w-full"
                    />

                    <Select
                      label="Tipo de operación*"
                      register={register}
                      name="tipo_operacion"
                      options={operationTypes}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
                      required
                    />
                    {errors.tipo_operacion && (
                      <p className="text-red-500 text-sm">
                        {errors.tipo_operacion.message}
                      </p>
                    )}

                    {watch('tipo_operacion') === 'Venta' && (
                      <>
                        <Select
                          label="Tipo de Inmueble*"
                          register={register}
                          name="tipo_inmueble"
                          options={propertyTypes}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
                          required
                        />
                        {errors.tipo_inmueble && (
                          <p className="text-red-500 text-sm">
                            {errors.tipo_inmueble.message}
                          </p>
                        )}
                      </>
                    )}

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exclusividad de la Operación*
                      </label>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            {...register('exclusiva')}
                            className="h-4 w-4 text-[#0077b6] rounded border-gray-300 focus:ring-[#0077b6]"
                          />
                          <label className="text-sm text-gray-700">
                            Exclusiva
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            {...register('no_exclusiva')}
                            className="h-4 w-4 text-[#0077b6] rounded border-gray-300 focus:ring-[#0077b6]"
                          />
                          <label className="text-sm text-gray-700">
                            No Exclusiva
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Ubicación */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPinIcon className="w-5 h-5 text-[#0077b6]" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      2. Ubicación
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <AddressAutocompleteManual
                      onAddressSelect={(address) => {
                        setAddressData((prev) => ({ ...prev, ...address }));
                        setValue('direccion_reserva', address.address);
                        setValue('localidad_reserva', address.city);
                        setValue('provincia_reserva', address.province);
                      }}
                      onHouseNumberChange={(houseNumber) =>
                        setAddressData((prev) => ({ ...prev, houseNumber }))
                      }
                    />
                  </div>
                </div>

                {/* Sección 3: Valores y Comisiones */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <CurrencyDollarIcon className="w-5 h-5 text-[#0077b6]" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      3. Valores y Comisiones
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="Valor de oferta / operación*"
                      type="number"
                      placeholder="Por ejemplo: 200000"
                      {...register('valor_reserva')}
                      error={errors.valor_reserva?.message}
                      required
                      className="w-full"
                    />

                    <Input
                      label="Porcentaje punta vendedora*"
                      type="text"
                      placeholder="Por ejemplo: 3%"
                      {...register('porcentaje_punta_vendedora', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      error={errors.porcentaje_punta_vendedora?.message}
                      required
                      className="w-full"
                    />

                    <Input
                      label="Porcentaje punta compradora*"
                      type="text"
                      placeholder="Por ejemplo: 4%"
                      {...register('porcentaje_punta_compradora', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      error={errors.porcentaje_punta_compradora?.message}
                      required
                      className="w-full"
                    />

                    <Input
                      label="Porcentaje honorarios totales"
                      type="text"
                      value={`${porcentajeHonorariosBroker.toFixed(2)}%`}
                      disabled
                      className="w-full bg-gray-100 cursor-not-allowed"
                    />

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad de puntas*
                      </label>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            {...register('punta_vendedora')}
                            className="h-4 w-4 text-[#0077b6] rounded border-gray-300 focus:ring-[#0077b6]"
                          />
                          <label className="text-sm text-gray-700">
                            Punta Vendedora
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            {...register('punta_compradora')}
                            className="h-4 w-4 text-[#0077b6] rounded border-gray-300 focus:ring-[#0077b6]"
                          />
                          <label className="text-sm text-gray-700">
                            Punta Compradora
                          </label>
                        </div>
                      </div>
                    </div>

                    <Input
                      label="Asignar Gastos a la operación"
                      type="number"
                      placeholder="Por ejemplo: 500"
                      {...register('gastos_operacion', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      error={errors.gastos_operacion?.message}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Sección 4: Reservas y Refuerzos */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-[#0077b6]" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      4. Reservas y Refuerzos
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="Tipo de reserva"
                      type="text"
                      placeholder="Por ejemplo: Sobre nº / Transferencia"
                      {...register('numero_sobre_reserva')}
                      error={errors.numero_sobre_reserva?.message}
                      className="w-full"
                    />

                    <Input
                      label="Monto de Reserva"
                      type="number"
                      placeholder="Por ejemplo: 2000"
                      {...register('monto_sobre_reserva')}
                      error={errors.monto_sobre_reserva?.message}
                      className="w-full"
                    />

                    <Input
                      label="Tipo de refuerzo"
                      type="text"
                      placeholder="Por ejemplo: Sobre nº / Transferencia"
                      {...register('numero_sobre_refuerzo')}
                      error={errors.numero_sobre_refuerzo?.message}
                      className="w-full"
                    />

                    <Input
                      label="Monto de refuerzo"
                      type="number"
                      placeholder="Por ejemplo: 4000"
                      {...register('monto_sobre_refuerzo')}
                      error={errors.monto_sobre_refuerzo?.message}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Sección 5: Referencias y Compartidos */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <UserGroupIcon className="w-5 h-5 text-[#0077b6]" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      5. Referencias y Compartidos
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="Datos Referido"
                      type="text"
                      placeholder="Por ejemplo: Juan Pérez"
                      {...register('referido')}
                      error={errors.referido?.message}
                      className="w-full"
                    />

                    <Input
                      label="Porcentaje Referido"
                      type="text"
                      placeholder="Por ejemplo: 25%"
                      {...register('porcentaje_referido', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      error={errors.porcentaje_referido?.message}
                      className="w-full"
                    />

                    <Input
                      label="Datos Compartido"
                      type="text"
                      placeholder="Por ejemplo: Juana Pérez"
                      {...register('compartido')}
                      error={errors.compartido?.message}
                      className="w-full"
                    />

                    <Input
                      label="Porcentaje Compartido"
                      type="text"
                      placeholder="Por ejemplo: 2%"
                      {...register('porcentaje_compartido', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      error={errors.porcentaje_compartido?.message}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Sección 6: Gestión de Asesores */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <UserGroupIcon className="w-5 h-5 text-[#0077b6]" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      6. Gestión de Asesores
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {userRole === UserRole.TEAM_LEADER_BROKER && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                          <span className="font-semibold">📋 Importante:</span>{' '}
                          Si sos Broker de una oficina o Team leader y
                          comercializas propiedades, en el siguiente input debes
                          poner el porcentaje que se lleva la franquicia o el
                          broker respectivamente para poder calcular el neto de
                          tu operación de manera correcta.
                        </p>
                      </div>
                    )}

                    <Input
                      label="Porcentaje destinado a franquicia o broker"
                      type="text"
                      placeholder="Por ejemplo: 11%"
                      {...register('isFranchiseOrBroker', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      error={errors.isFranchiseOrBroker?.message}
                      className="w-full"
                    />

                    {userRole === UserRole.TEAM_LEADER_BROKER && (
                      <>
                        <Input
                          label="Repartición de honorarios inmobiliarios a un asesor o corredor inmobiliario según acuerdo previo."
                          type="number"
                          placeholder="Por ejemplo: 2%"
                          {...register('reparticion_honorarios_asesor', {
                            setValueAs: (value) => parseFloat(value) || 0,
                          })}
                          error={errors.reparticion_honorarios_asesor?.message}
                          className="w-full"
                        />

                        <Select
                          label="Asesor que realizó la venta"
                          register={register}
                          name="realizador_venta"
                          placeholder=""
                          options={[
                            {
                              value: '',
                              label: 'Selecciona un asesor',
                            },
                            ...usersMapped
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((member) => ({
                                value: member.name,
                                label: member.name,
                              })),
                          ]}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
                        />
                      </>
                    )}

                    <Input
                      label="Porcentaje honorarios asesor*"
                      type="text"
                      placeholder="Por ejemplo: 45%"
                      value={
                        isTeamLeaderPrimaryAdvisor &&
                        userRole === UserRole.TEAM_LEADER_BROKER
                          ? '100%'
                          : undefined
                      }
                      disabled={
                        isTeamLeaderPrimaryAdvisor &&
                        userRole === UserRole.TEAM_LEADER_BROKER
                      }
                      {...register('porcentaje_honorarios_asesor', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      error={errors.porcentaje_honorarios_asesor?.message}
                      className="w-full"
                    />

                    {isTeamLeaderPrimaryAdvisor &&
                      userRole === UserRole.TEAM_LEADER_BROKER && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-700">
                            <span className="font-semibold">
                              ℹ️ Información:
                            </span>{' '}
                            Cuando el Team Leader participa se lleva el 100% del
                            50% del bruto restante.
                          </p>
                        </div>
                      )}

                    {showAdditionalAdvisor && (
                      <>
                        <Select
                          label="Asesor adicional"
                          register={register}
                          name="realizador_venta_adicional"
                          options={[
                            {
                              value: '',
                              label:
                                'Selecciona el asesor participante en la operación',
                            },
                            ...usersMapped
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((member) => ({
                                value: member.name,
                                label: member.name,
                              })),
                          ]}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
                        />

                        <Input
                          label="Porcentaje honorarios asesor adicional"
                          type="text"
                          placeholder="Por ejemplo: 40%"
                          value={
                            isTeamLeaderAdditionalAdvisor &&
                            userRole === UserRole.TEAM_LEADER_BROKER
                              ? '100%'
                              : undefined
                          }
                          disabled={
                            isTeamLeaderAdditionalAdvisor &&
                            userRole === UserRole.TEAM_LEADER_BROKER
                          }
                          {...register(
                            'porcentaje_honorarios_asesor_adicional',
                            {
                              setValueAs: (value) => parseFloat(value) || 0,
                            }
                          )}
                          error={
                            errors.porcentaje_honorarios_asesor_adicional
                              ?.message
                          }
                          className="w-full"
                        />

                        {isTeamLeaderAdditionalAdvisor &&
                          userRole === UserRole.TEAM_LEADER_BROKER && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-700">
                                <span className="font-semibold">
                                  ℹ️ Información:
                                </span>{' '}
                                Cuando el Team Leader participa se lleva el 100%
                                del 50% del bruto restante.
                              </p>
                            </div>
                          )}
                      </>
                    )}

                    {userRole === UserRole.TEAM_LEADER_BROKER && (
                      <div className="flex justify-between mt-4">
                        <button
                          type="button"
                          className="text-[#0077b6] hover:text-[#005a8a] font-semibold text-sm transition-colors"
                          onClick={toggleAdditionalAdvisor}
                        >
                          {showAdditionalAdvisor
                            ? 'Eliminar asesor adicional'
                            : 'Agregar asesor adicional a la operación'}
                        </button>
                        <button
                          type="button"
                          className="text-[#0077b6] hover:text-[#005a8a] font-semibold text-sm transition-colors"
                          onClick={() => setIsAddUserModalOpen(true)}
                        >
                          Crear Asesor
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 7: Observaciones - Ancho completo */}
              <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <DocumentTextIcon className="w-5 h-5 text-[#0077b6]" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    7. Información Adicional
                  </h3>
                </div>
                <TextArea
                  className="w-full"
                  label="Observaciones"
                  placeholder="Información adicional sobre la operación..."
                  {...register('observaciones')}
                  error={errors.observaciones?.message}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 justify-end pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push(PATHS.DASHBOARD)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white rounded-lg hover:from-[#005a8a] hover:to-[#001d3b] transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? 'Guardando...' : 'Guardar Operación'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de confirmación (mantenido para compatibilidad) */}
      <ModalOK
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
        onAccept={handleModalAccept}
      />

      {/* Modal para agregar usuario */}
      {isAddUserModalOpen && (
        <AddUserModal onClose={() => setIsAddUserModalOpen(false)} />
      )}

      {/* Toast Component */}
      <Toast
        type={toastType}
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
};

export default OperationsForm;
