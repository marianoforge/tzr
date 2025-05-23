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

  const [porcentajeHonorariosBroker, setPorcentajeHonorariosBroker] =
    useState(0);

  // Custom style for select components to override the text color
  const selectStyle = '!text-black font-normal';

  useEffect(() => {
    if (operation) {
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
      }
    }
  }, [operation, reset]);

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
      onUpdate();
      onClose();
    },
    onError: (error) => {
      console.error('Error updating operation:', error);
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!operation?.id) {
      console.error('Operation ID is missing');
      return;
    }

    // Find the selected user by name to get the uid
    const selectedUser = usersMapped.find(
      (user) => user.name === data.realizador_venta
    );
    const selectedUser_id = selectedUser?.uid || null; // Permitir null

    const realizador_venta =
      userData?.role === UserRole.AGENTE_ASESOR && !selectedUser_id
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : data.realizador_venta;

    // Find the additional advisor by name to get the uid
    const selectedUserAdicional = usersMapped.find(
      (user) => user.name === data.realizador_venta_adicional
    );
    const selectedUser_idAdicional = selectedUserAdicional
      ? selectedUserAdicional.uid
      : null;

    // Calcular los honorarios del broker basados en el valor de reserva y el porcentaje actualizado
    const honorarios_broker = data.valor_reserva
      ? data.valor_reserva * (porcentajeHonorariosBroker / 100)
      : 0;

    const { honorariosAsesor } = calculateHonorarios(
      data.valor_reserva,
      data.porcentaje_honorarios_asesor || 0,
      porcentajeHonorariosBroker || 0,
      data.porcentaje_compartido || 0,
      data.porcentaje_referido || 0
    );

    const fechaOperacion = data.fecha_operacion?.trim()
      ? data.fecha_operacion
      : '';
    const fechaReserva = data.fecha_reserva?.trim() ? data.fecha_reserva : '';

    const fechaCaptacion = data.fecha_captacion?.trim()
      ? data.fecha_captacion
      : '';

    if (!fechaReserva) {
      console.error('La fecha de reserva es obligatoria');
      return;
    }

    const payload = {
      ...data,
      honorarios_broker: honorarios_broker, // Usar el valor calculado con el porcentaje actualizado
      honorarios_asesor: honorariosAsesor,
      user_uid: selectedUser_id,
      user_uid_adicional: selectedUser_idAdicional,
      pais: addressData.country || undefined,
      numero_casa: addressData.houseNumber || undefined,
      direccion_reserva: addressData.address || undefined,
      localidad_reserva: addressData.city || undefined,
      provincia_reserva: addressData.province || undefined,
      reparticion_honorarios_asesor:
        data.reparticion_honorarios_asesor ?? undefined,
      fecha_operacion: fechaOperacion,
      fecha_reserva: fechaReserva,
      fecha_captacion: fechaCaptacion,
      porcentaje_honorarios_broker: porcentajeHonorariosBroker,
      realizador_venta: realizador_venta || undefined,
      porcentaje_honorarios_asesor:
        data.porcentaje_honorarios_asesor || undefined,
    };
    mutation.mutate({ id: operation.id, data: payload });
  };

  const [showAdditionalAdvisor, setShowAdditionalAdvisor] = useState(false);

  const toggleAdditionalAdvisor = () => {
    setShowAdditionalAdvisor((prev) => !prev);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg font-bold w-[90%] lg:w-[80%] xl:w-[40%] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-center top-0 bg-white pt-2 z-10">
          Editar Operación
        </h2>

        {isLoading ? (
          // Skeleton loading state
          <div className="space-y-4 overflow-y-auto">
            {Array(15)
              .fill(0)
              .map((_, index) => (
                <InputSkeleton key={`input-skeleton-${index}`} />
              ))}
          </div>
        ) : (
          // Actual form content
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 overflow-y-auto"
          >
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

            <label className="font-semibold text-mediumBlue">
              Exclusividad de la Operación*
            </label>
            <div className="flex gap-10 mt-2 mb-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('exclusiva')} />
                <label>Exclusiva</label>
              </div>
              {errors.exclusiva && (
                <p className="text-red-500">{errors.exclusiva.message}</p>
              )}

              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('no_exclusiva')} />
                <label>No Exclusiva</label>
              </div>
              {errors.no_exclusiva && (
                <p className="text-red-500">{errors.no_exclusiva.message}</p>
              )}
            </div>

            <Input
              label="Valor de Reserva"
              type="number"
              {...register('valor_reserva')}
              placeholder="Valor de Reserva"
              error={errors.valor_reserva?.message}
              required
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

            <Input
              label="Porcentaje Honorarios Totales"
              type="text"
              step="any"
              value={`${porcentajeHonorariosBroker.toFixed(2)}%`}
              disabled
            />

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

            {userRole === UserRole.TEAM_LEADER_BROKER && (
              <Input
                label="Porcentaje destinado a reparticion de honorarios asesor"
                type="text"
                {...register('reparticion_honorarios_asesor', {
                  setValueAs: (value) => parseFloat(value) || 0,
                })}
                placeholder="Por ejemplo: 10%"
                error={errors.reparticion_honorarios_asesor?.message}
              />
            )}

            {userRole === UserRole.TEAM_LEADER_BROKER && (
              <>
                <Select
                  label="Asesor que realizó la venta"
                  register={register}
                  name="realizador_venta"
                  options={[
                    {
                      value: '',
                      label: 'Selecciona el asesor que realizó la operación',
                    },
                    ...usersMapped
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((member) => ({
                        value: member.name,
                        label: member.name,
                      })),
                  ]}
                  className={`w-full p-2 mb-8 border border-gray-300 rounded ${selectStyle}`}
                  defaultValue={watch('realizador_venta') || ''}
                />
                {errors.realizador_venta && (
                  <p className="text-red-500">
                    {errors.realizador_venta.message}
                  </p>
                )}
              </>
            )}

            <Input
              label="Porcentaje Honorarios Asesor"
              type="text"
              step="any"
              {...register('porcentaje_honorarios_asesor', {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              error={errors.porcentaje_honorarios_asesor?.message}
            />

            {/* Additional advisor input block */}
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
                  className={`w-full p-2 mb-8 border border-gray-300 rounded ${selectStyle}`}
                  defaultValue={watch('realizador_venta_adicional') || ''}
                />
                {errors.realizador_venta_adicional && (
                  <p className="text-red-500">
                    {errors.realizador_venta_adicional.message}
                  </p>
                )}

                <Input
                  label="Porcentaje honorarios asesor adicional"
                  type="text"
                  placeholder="Por ejemplo: 40%"
                  {...register('porcentaje_honorarios_asesor_adicional', {
                    setValueAs: (value) => parseFloat(value) || 0,
                  })}
                  error={errors.porcentaje_honorarios_asesor_adicional?.message}
                />
              </>
            )}
            {userRole === 'team_leader_broker' && (
              <p
                className="text-lightBlue font-semibold text-sm mb-6 -mt-4 cursor-pointer"
                onClick={toggleAdditionalAdvisor}
              >
                {showAdditionalAdvisor
                  ? 'Eliminar Segundo Asesor'
                  : 'Agregar Otro Asesor'}
              </p>
            )}

            <TextArea
              label="Observaciones"
              {...register('observaciones')}
              error={errors.observaciones?.message}
            />

            <div className="flex justify-around items-center ">
              <div className="flex items-center gap-2 my-4">
                <input type="checkbox" {...register('punta_vendedora')} />
                <label>Punta Vendedora</label>
              </div>
              {errors.punta_vendedora && (
                <p className="text-redAccent">
                  {errors.punta_vendedora.message}
                </p>
              )}

              <div className="flex items-center gap-2 my-4">
                <input type="checkbox" {...register('punta_compradora')} />
                <label>Punta Compradora</label>
              </div>
              {errors.punta_compradora && (
                <p className="text-redAccent">
                  {errors.punta_compradora.message}
                </p>
              )}
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
        )}
      </div>
    </div>
  );
};

export default OperationsModal;
