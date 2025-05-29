import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InferType } from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Input from '@/components/PrivateComponente/FormComponents/Input';
import Select from '@/components/PrivateComponente/FormComponents/Select';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import { calculateHonorarios } from '@/common/utils/calculations';
import { schema } from '@/common/schemas/operationsFormSchema';
import { updateOperation } from '@/lib/api/operationsApi';
import { TeamMember, UserData } from '@/common/types/';
import { useTeamMembers } from '@/common/hooks/useTeamMembers';
import { useUserDataStore } from '@/stores/userDataStore';
import { operationTypes, propertyTypes } from '@/lib/data';
import TextArea from '@/components/PrivateComponente/FormComponents/TextArea';
import AddressAutocompleteManual from '@/components/PrivateComponente/PlacesComponents/AddressAutocomplete';
import { UserRole } from '@/common/enums';

type FormData = InferType<typeof schema>;
type AddressData = {
  address: string;
  city: string | null;
  province: string | null;
  country: string | null;
  houseNumber: string;
};

interface OperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: (FormData & { id: string; user_uid: string }) | null;
  onUpdate: () => void;
  currentUser: UserData;
}

// Toast Component
const Toast: React.FC<{
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
}> = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, type === 'error' ? 4000 : 3000); // Error toast stays longer
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, type]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const iconBgColor = type === 'success' ? 'bg-white' : 'bg-white';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';
  const textColor = type === 'success' ? 'text-green-100' : 'text-red-100';
  const hoverBgColor =
    type === 'success' ? 'hover:bg-green-600' : 'hover:bg-red-600';

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transition-all duration-500 ease-out transform ${
        isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-xl flex items-center space-x-3 min-w-[300px] backdrop-blur-sm`}
      >
        <div className="flex-shrink-0">
          <div
            className={`w-5 h-5 ${iconBgColor} rounded-full flex items-center justify-center`}
          >
            {type === 'success' ? (
              <svg
                className={`w-3 h-3 ${iconColor}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className={`w-3 h-3 ${iconColor}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${textColor} hover:text-white transition-colors duration-200 p-1 rounded-full ${hoverBgColor}`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const OperationsModal: React.FC<OperationsModalProps> = ({
  isOpen,
  onClose,
  operation,
  onUpdate,
  currentUser,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
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
      realizador_venta: '',
      realizador_venta_adicional: '',
      porcentaje_honorarios_asesor: null,
      porcentaje_honorarios_asesor_adicional: null,
    },
  });

  const [addressData, setAddressData] = useState<AddressData>({
    address: '',
    city: null,
    province: null,
    country: null,
    houseNumber: '',
  });

  const [showAdditionalAdvisor, setShowAdditionalAdvisor] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState('');

  const queryClient = useQueryClient();
  const { data: teamMembers, isLoading: isTeamMembersLoading } =
    useTeamMembers();
  const { userData } = useUserDataStore();
  const userRole = userData?.role;
  const [isLoading, setIsLoading] = useState(true);

  const usersMapped = [
    ...(teamMembers?.map((member: TeamMember) => ({
      name: `${member.firstName} ${member.lastName}`,
      uid: member.id,
    })) || []),
    ...(currentUser.uid
      ? [
          {
            name:
              `${currentUser.firstName} ${currentUser?.lastName}` ||
              'Logged User',
            uid: currentUser.uid,
          },
        ]
      : []),
  ];

  // Detectar si el Team Leader está seleccionado como asesor
  const currentUserName =
    `${currentUser.firstName} ${currentUser?.lastName}` || 'Logged User';
  const isTeamLeaderPrimaryAdvisor =
    watch('realizador_venta') === currentUserName;
  const isTeamLeaderAdditionalAdvisor =
    watch('realizador_venta_adicional') === currentUserName;

  const [porcentajeHonorariosBroker, setPorcentajeHonorariosBroker] =
    useState(0);

  // Función para mostrar toast de error
  const showError = (message: string) => {
    setErrorToastMessage(message);
    setShowErrorToast(true);
  };

  // Función para validar campos obligatorios
  const validateRequiredFields = (data: FormData): string | null => {
    if (!data.fecha_reserva) {
      return 'La fecha de reserva es obligatoria';
    }
    if (!data.valor_reserva || data.valor_reserva <= 0) {
      return 'El valor de reserva es obligatorio y debe ser mayor a 0';
    }
    if (!data.tipo_operacion) {
      return 'El tipo de operación es obligatorio';
    }
    if (!data.exclusiva && !data.no_exclusiva) {
      return 'Debe seleccionar el tipo de exclusividad de la operación';
    }
    if (data.exclusiva && data.no_exclusiva) {
      return 'No puede seleccionar exclusiva y no exclusiva a la vez';
    }
    if (!addressData.address) {
      return 'La dirección de la propiedad es obligatoria';
    }
    return null;
  };

  useEffect(() => {
    if (operation && isOpen) {
      const formattedOperation = {
        ...operation,
        fecha_operacion: operation.fecha_operacion
          ? new Date(operation.fecha_operacion).toISOString().split('T')[0]
          : '',
        porcentaje_punta_compradora: operation.porcentaje_punta_compradora || 0,
        porcentaje_punta_vendedora: operation.porcentaje_punta_vendedora || 0,
        realizador_venta: operation.realizador_venta || '',
        realizador_venta_adicional: operation.realizador_venta_adicional || '',
        porcentaje_honorarios_asesor:
          operation.porcentaje_honorarios_asesor || 0,
        porcentaje_honorarios_asesor_adicional:
          operation.porcentaje_honorarios_asesor_adicional || 0,
      };
      reset(formattedOperation);

      setAddressData({
        address: operation.direccion_reserva || '',
        city: operation.localidad_reserva || null,
        province: operation.provincia_reserva || null,
        country: operation.pais || null,
        houseNumber: operation.numero_casa || '',
      });
      if (operation.realizador_venta_adicional) {
        setShowAdditionalAdvisor(true);
      } else {
        setShowAdditionalAdvisor(false);
      }
    }
  }, [operation, reset, isOpen]);

  // Reset form when modal closes to ensure clean state for next open
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowAdditionalAdvisor(false);
      setAddressData({
        address: '',
        city: null,
        province: null,
        country: null,
        houseNumber: '',
      });
    }
  }, [isOpen, reset]);

  useEffect(() => {
    const porcentaje_punta_compradora =
      parseFloat(String(watch('porcentaje_punta_compradora'))) || 0;
    const porcentaje_punta_vendedora =
      parseFloat(String(watch('porcentaje_punta_vendedora'))) || 0;

    setPorcentajeHonorariosBroker(
      porcentaje_punta_compradora + porcentaje_punta_vendedora
    );
  }, [
    watch('porcentaje_punta_compradora'),
    watch('porcentaje_punta_vendedora'),
    setPorcentajeHonorariosBroker,
    watch,
  ]);

  useEffect(() => {
    // Set loading state based on data availability
    if (isOpen && operation && !isTeamMembersLoading) {
      // Give a slight delay to ensure all data is properly loaded and rendered
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [isOpen, operation, isTeamMembersLoading]);

  const mutation = useMutation({
    mutationFn: updateOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      setToastMessage('Cambio guardado exitosamente');
      setShowToast(true);
      onUpdate();
      setTimeout(() => {
        onClose();
      }, 1000); // Delay close to show toast
    },
    onError: (error: any) => {
      console.error('Error updating operation:', error);
      // Determinar el mensaje de error basado en el tipo de error
      let errorMessage = 'Error al guardar los cambios';

      if (error?.message) {
        if (
          error.message.includes('network') ||
          error.message.includes('Network')
        ) {
          errorMessage =
            'Error de conexión. Verifica tu internet y vuelve a intentar';
        } else if (
          error.message.includes('permission') ||
          error.message.includes('Permission')
        ) {
          errorMessage = 'No tienes permisos para realizar esta acción';
        } else if (
          error.message.includes('validation') ||
          error.message.includes('Validation')
        ) {
          errorMessage = 'Los datos ingresados no son válidos';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else if (error?.status) {
        switch (error.status) {
          case 400:
            errorMessage = 'Datos inválidos. Revisa la información ingresada';
            break;
          case 401:
            errorMessage = 'Sesión expirada. Inicia sesión nuevamente';
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción';
            break;
          case 404:
            errorMessage = 'La operación que intentas editar no existe';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde';
            break;
          default:
            errorMessage = 'Error desconocido al guardar los cambios';
        }
      }

      showError(errorMessage);
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      if (!operation) return;

      // Validar campos obligatorios antes de enviar
      const validationError = validateRequiredFields(data);
      if (validationError) {
        showError(validationError);
        return;
      }

      // Calculate honorarios for advisor and broker
      const honorarios = calculateHonorarios(
        data.valor_reserva,
        data.porcentaje_honorarios_asesor || 0,
        data.porcentaje_honorarios_broker || 0,
        data.porcentaje_compartido || 0
      );

      // Prepare complete operation data, ensuring all values match Operation interface
      const operationData: any = {
        ...data,
        direccion_reserva: addressData.address || '',
        localidad_reserva: addressData.city || '',
        provincia_reserva: addressData.province || '',
        honorarios_asesor: honorarios.honorariosAsesor,
        honorarios_broker: honorarios.honorariosBroker,
        numero_casa: addressData.houseNumber || '',
        pais: addressData.country || '',
        reparticion_honorarios_asesor: data.reparticion_honorarios_asesor || 0,
      };

      await mutation.mutateAsync({
        id: operation.id,
        data: operationData,
      });
    } catch (error) {
      console.error('Error updating operation:', error);
      showError('Error inesperado al procesar la operación');
    }
  };

  const toggleAdditionalAdvisor = () => {
    setShowAdditionalAdvisor((newValue) => {
      if (!newValue) {
        setValue('realizador_venta_adicional', '');
        setValue('porcentaje_honorarios_asesor_adicional', 0);
      }
      return newValue;
    });
  };

  // Skeleton loader component for inputs
  const InputSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  );

  if (!isOpen || !operation) return null;

  return (
    <>
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />

      <Toast
        message={errorToastMessage}
        isVisible={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        type="error"
      />

      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-4 mx-auto p-0 border w-[95%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] shadow-lg rounded-xl bg-white max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-xl">
            <h2 className="text-2xl font-bold">Editar Operación</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
            {isLoading ? (
              // Skeleton loading state
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(12)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={`input-skeleton-${index}`}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <InputSkeleton />
                    </div>
                  ))}
              </div>
            ) : (
              // Actual form content
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Sección: Información General */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-[#0077b6] text-lg border-b border-[#0077b6] pb-2 mb-4">
                    INFORMACIÓN GENERAL
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Fecha de Captación / Publicación"
                      type="date"
                      {...register('fecha_captacion')}
                      error={errors.fecha_captacion?.message}
                    />
                    <Input
                      label="Fecha de Reserva"
                      type="date"
                      {...register('fecha_reserva')}
                      error={errors.fecha_reserva?.message}
                      required
                    />
                    <Input
                      label="Fecha de Cierre"
                      type="date"
                      {...register('fecha_operacion', {
                        setValueAs: (value) => value || null,
                      })}
                      error={errors.fecha_operacion?.message}
                    />
                    <Select
                      label="Tipo de Operación"
                      options={operationTypes}
                      register={register}
                      name="tipo_operacion"
                      error={errors.tipo_operacion?.message}
                    />
                    {watch('tipo_operacion') === 'Venta' && (
                      <Select
                        label="Tipo de Inmueble"
                        options={propertyTypes}
                        register={register}
                        name="tipo_inmueble"
                        error={errors.tipo_inmueble?.message}
                      />
                    )}
                  </div>

                  {/* Exclusividad */}
                  <div className="mt-4">
                    <label className="font-semibold text-[#0077b6] block mb-3">
                      Exclusividad de la Operación*
                    </label>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register('exclusiva')}
                          className="w-4 h-4 text-[#0077b6] border-gray-300 rounded focus:ring-[#0077b6]"
                        />
                        <label className="text-gray-700">Exclusiva</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register('no_exclusiva')}
                          className="w-4 h-4 text-[#0077b6] border-gray-300 rounded focus:ring-[#0077b6]"
                        />
                        <label className="text-gray-700">No Exclusiva</label>
                      </div>
                    </div>
                    {(errors.exclusiva || errors.no_exclusiva) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.exclusiva?.message ||
                          errors.no_exclusiva?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sección: Ubicación */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-[#0077b6] text-lg border-b border-[#0077b6] pb-2 mb-4">
                    UBICACIÓN
                  </h3>
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
                    initialAddress={addressData.address}
                    initialHouseNumber={addressData.houseNumber}
                  />
                </div>

                {/* Sección: Valores y Comisiones */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-[#0077b6] text-lg border-b border-[#0077b6] pb-2 mb-4">
                    VALORES Y COMISIONES
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Valor de Reserva"
                      type="number"
                      {...register('valor_reserva')}
                      placeholder="Valor de Reserva"
                      error={errors.valor_reserva?.message}
                      required
                    />
                    <Input
                      label="Porcentaje Honorarios Totales"
                      type="text"
                      step="any"
                      value={`${porcentajeHonorariosBroker.toFixed(2)}%`}
                      disabled
                    />
                    <Input
                      label="Porcentaje Punta Compradora"
                      type="text"
                      step="any"
                      {...register('porcentaje_punta_compradora', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      error={errors.porcentaje_punta_compradora?.message}
                      required
                    />
                    <Input
                      label="Porcentaje Punta Vendedora"
                      type="text"
                      step="any"
                      {...register('porcentaje_punta_vendedora', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      error={errors.porcentaje_punta_vendedora?.message}
                      required
                    />
                  </div>

                  {/* Puntas */}
                  <div className="mt-4">
                    <label className="font-semibold text-[#0077b6] block mb-3">
                      Puntas de la Operación
                    </label>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register('punta_vendedora')}
                          className="w-4 h-4 text-[#0077b6] border-gray-300 rounded focus:ring-[#0077b6]"
                        />
                        <label className="text-gray-700">Punta Vendedora</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register('punta_compradora')}
                          className="w-4 h-4 text-[#0077b6] border-gray-300 rounded focus:ring-[#0077b6]"
                        />
                        <label className="text-gray-700">
                          Punta Compradora
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección: Reservas y Refuerzos */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-[#0077b6] text-lg border-b border-[#0077b6] pb-2 mb-4">
                    RESERVAS Y REFUERZOS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Tipo de reserva"
                      type="text"
                      {...register('numero_sobre_reserva')}
                      placeholder="Tipo de reserva"
                      error={errors.numero_sobre_reserva?.message}
                    />
                    <Input
                      label="Monto de Reserva"
                      type="text"
                      {...register('monto_sobre_reserva')}
                      placeholder="Por ejemplo: 2000"
                      error={errors.monto_sobre_reserva?.message}
                    />
                    <Input
                      label="Tipo de refuerzo"
                      type="text"
                      {...register('numero_sobre_refuerzo')}
                      placeholder="Tipo de refuerzo"
                      error={errors.numero_sobre_refuerzo?.message}
                    />
                    <Input
                      label="Monto de refuerzo"
                      type="text"
                      {...register('monto_sobre_refuerzo')}
                      placeholder="Por ejemplo: 4000"
                      error={errors.monto_sobre_refuerzo?.message}
                    />
                    <Input
                      label="Asignar Gastos a la operación"
                      type="text"
                      {...register('gastos_operacion', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      placeholder="Por ejemplo: 500"
                      error={errors.gastos_operacion?.message}
                    />
                  </div>
                </div>

                {/* Sección: Referencias y Compartidos */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-[#0077b6] text-lg border-b border-[#0077b6] pb-2 mb-4">
                    REFERENCIAS Y COMPARTIDOS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Datos Referido"
                      type="text"
                      {...register('referido')}
                      placeholder="Datos Referido"
                      error={errors.referido?.message}
                    />
                    <Input
                      label="Porcentaje Referido"
                      type="text"
                      step="any"
                      {...register('porcentaje_referido', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      placeholder="Por ejemplo 10%"
                      error={errors.porcentaje_referido?.message}
                    />
                    <Input
                      label="Datos Compartido"
                      type="text"
                      {...register('compartido')}
                      placeholder="Datos Compartido"
                      error={errors.compartido?.message}
                    />
                    <Input
                      label="Porcentaje Compartido"
                      type="text"
                      step="any"
                      {...register('porcentaje_compartido', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      placeholder="Por ejemplo: 25%"
                      error={errors.porcentaje_compartido?.message}
                    />
                    <Input
                      label="Porcentaje destinado a franquicia o broker"
                      type="text"
                      {...register('isFranchiseOrBroker', {
                        setValueAs: (value) => parseFloat(value) || 0,
                      })}
                      placeholder="Por ejemplo: 10%"
                      error={errors.isFranchiseOrBroker?.message}
                    />
                  </div>
                </div>

                {/* Sección: Gestión de Asesores (Solo para Team Leaders) */}
                {userRole === UserRole.TEAM_LEADER_BROKER && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-[#0077b6] text-lg border-b border-[#0077b6] pb-2 mb-4">
                      GESTIÓN DE ASESORES
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Porcentaje destinado a reparticion de honorarios asesor"
                        type="text"
                        {...register('reparticion_honorarios_asesor', {
                          setValueAs: (value) => parseFloat(value) || 0,
                        })}
                        placeholder="Por ejemplo: 10%"
                        error={errors.reparticion_honorarios_asesor?.message}
                      />

                      <div className="md:col-span-2">
                        <Select
                          label="Asesor que realizó la venta"
                          register={register}
                          name="realizador_venta"
                          options={[
                            {
                              value: '',
                              label:
                                'Selecciona el asesor que realizó la operación',
                            },
                            ...usersMapped
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((member) => ({
                                value: member.name,
                                label: member.name,
                              })),
                          ]}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#0077b6] focus:border-[#0077b6]"
                          defaultValue={watch('realizador_venta') || ''}
                        />
                        {errors.realizador_venta && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.realizador_venta.message}
                          </p>
                        )}
                      </div>

                      <Input
                        label="Porcentaje Honorarios Asesor"
                        type="text"
                        step="any"
                        value={isTeamLeaderPrimaryAdvisor ? '100%' : undefined}
                        disabled={isTeamLeaderPrimaryAdvisor}
                        {...register('porcentaje_honorarios_asesor', {
                          setValueAs: (value) => parseFloat(value) || 0,
                        })}
                        error={errors.porcentaje_honorarios_asesor?.message}
                      />

                      {isTeamLeaderPrimaryAdvisor && (
                        <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-700">
                            <span className="font-semibold">
                              ℹ️ Información:
                            </span>{' '}
                            Cuando el Team Leader participa se lleva el 100% del
                            50% del bruto restante.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Additional advisor section */}
                    {showAdditionalAdvisor && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-300">
                        <div className="md:col-span-2">
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
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#0077b6] focus:border-[#0077b6]"
                            defaultValue={
                              watch('realizador_venta_adicional') || ''
                            }
                          />
                          {errors.realizador_venta_adicional && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.realizador_venta_adicional.message}
                            </p>
                          )}
                        </div>

                        <Input
                          label="Porcentaje honorarios asesor adicional"
                          type="text"
                          placeholder="Por ejemplo: 40%"
                          value={
                            isTeamLeaderAdditionalAdvisor ? '100%' : undefined
                          }
                          disabled={isTeamLeaderAdditionalAdvisor}
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
                        />

                        {isTeamLeaderAdditionalAdvisor && (
                          <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-700">
                              <span className="font-semibold">
                                ℹ️ Información:
                              </span>{' '}
                              Cuando el Team Leader participa se lleva el 100%
                              del 50% del bruto restante.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4">
                      <button
                        type="button"
                        className="text-[#0077b6] font-semibold text-sm hover:text-[#023e8a] cursor-pointer transition-colors duration-200"
                        onClick={toggleAdditionalAdvisor}
                      >
                        {showAdditionalAdvisor
                          ? '➖ Eliminar Segundo Asesor'
                          : '➕ Agregar Otro Asesor'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sección: Observaciones */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-[#0077b6] text-lg border-b border-[#0077b6] pb-2 mb-4">
                    OBSERVACIONES
                  </h3>
                  <TextArea
                    label="Observaciones"
                    {...register('observaciones')}
                    error={errors.observaciones?.message}
                    rows={4}
                    placeholder="Ingrese cualquier observación adicional sobre la operación..."
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 justify-center pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white px-8 py-3 rounded-lg hover:from-[#023e8a] hover:to-[#0077b6] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OperationsModal;
