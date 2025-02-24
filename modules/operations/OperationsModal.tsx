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
import { operationTypes } from '@/lib/data';
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
      ...operation,
      realizador_venta: operation?.realizador_venta || '',
      exclusiva: operation?.exclusiva || false,
      no_exclusiva: operation?.no_exclusiva || false,
      fecha_operacion: operation?.fecha_operacion || null,
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
  const { data: teamMembers } = useTeamMembers();
  const { userData } = useUserDataStore();
  const userRole = userData?.role;
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

  useEffect(() => {
    if (operation) {
      const formattedOperation = {
        ...operation,
        fecha_operacion: operation.fecha_operacion
          ? new Date(operation.fecha_operacion).toISOString().split('T')[0]
          : '',
        porcentaje_punta_compradora: operation.porcentaje_punta_compradora || 0,
        porcentaje_punta_vendedora: operation.porcentaje_punta_vendedora || 0,
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
  ]);

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

    const { honorariosBroker, honorariosAsesor } = calculateHonorarios(
      data.valor_reserva,
      data.porcentaje_honorarios_asesor || 0,
      data.porcentaje_honorarios_broker || 0,
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
      honorarios_broker: honorariosBroker,
      honorarios_asesor: honorariosAsesor,
      user_uid: selectedUser_id,
      user_uid_adicional: selectedUser_idAdicional,
      pais: addressData.country,
      numero_casa: addressData.houseNumber,
      direccion_reserva: addressData.address,
      localidad_reserva: addressData.city,
      provincia_reserva: addressData.province,
      reparticion_honorarios_asesor:
        data.reparticion_honorarios_asesor ?? undefined,
      fecha_operacion: fechaOperacion,
      fecha_reserva: fechaReserva,
      fecha_captacion: fechaCaptacion,
    };

    // Ensure realizador_venta is not null before submitting
    const sanitizedPayload = {
      ...payload,
      realizador_venta: realizador_venta ?? '',
      realizador_venta_adicional: showAdditionalAdvisor
        ? payload.realizador_venta_adicional
        : undefined,
      porcentaje_honorarios_asesor_adicional: showAdditionalAdvisor
        ? payload.porcentaje_honorarios_asesor_adicional
        : undefined,
      user_uid_adicional: showAdditionalAdvisor
        ? selectedUser_idAdicional
        : null,
      porcentaje_honorarios_asesor:
        payload.porcentaje_honorarios_asesor ?? undefined,
      reparticion_honorarios_asesor:
        payload.reparticion_honorarios_asesor ?? undefined,
      localidad_reserva: payload.localidad_reserva || undefined,
      provincia_reserva: payload.provincia_reserva || undefined,
      pais: payload.pais || undefined,
      numero_casa: payload.numero_casa || undefined,
      direccion_reserva: payload.direccion_reserva || undefined,
      fecha_operacion:
        payload.fecha_operacion !== undefined ? payload.fecha_operacion : '',
      fecha_captacion:
        payload.fecha_captacion !== undefined ? payload.fecha_captacion : '',
      fecha_reserva:
        payload.fecha_reserva !== undefined ? payload.fecha_reserva : '',
    };
    mutation.mutate({ id: operation.id, data: sanitizedPayload });
  };

  const [showAdditionalAdvisor, setShowAdditionalAdvisor] = useState(false);

  const toggleAdditionalAdvisor = () => {
    setShowAdditionalAdvisor((prev) => !prev);
  };
  if (!isOpen || !operation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg font-bold w-[90%] lg:w-[80%] xl:w-[40%] max-h-[80vh] overflow-y-auto flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Editar Operación
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            label="Sobre de Reserva"
            type="text"
            {...register('numero_sobre_reserva')}
            placeholder="Sobre de Reserva"
            error={errors.numero_sobre_reserva?.message}
          />

          <Input
            label="Monto Sobre de Reserva"
            type="text"
            {...register('monto_sobre_reserva')}
            placeholder="Por ejemplo: 2000"
            error={errors.monto_sobre_reserva?.message}
          />

          <Input
            label="Sobre de Refuerzo"
            type="text"
            {...register('numero_sobre_refuerzo')}
            placeholder="Sobre de Refuerzo"
            error={errors.numero_sobre_refuerzo?.message}
          />

          <Input
            label="Monto Sobre de Refuerzo"
            type="text"
            {...register('monto_sobre_refuerzo')}
            placeholder="Por ejemplo: 4000"
            error={errors.monto_sobre_refuerzo?.message}
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

          {userRole === UserRole.TEAM_LEADER_BROKER && (
            <Input
              label="Porcentaje destinado a franquicia o broker"
              type="text"
              {...register('isFranchiseOrBroker', {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              placeholder="Por ejemplo: 10%"
              error={errors.isFranchiseOrBroker?.message}
            />
          )}

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
                {...register('realizador_venta')}
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
                className="w-full p-2 mb-8 border border-gray-300 rounded"
                defaultValue={operation?.realizador_venta || ''}
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
                {...register('realizador_venta_adicional')}
                options={[
                  {
                    value: '',
                    label: 'Selecciona el asesor participante en la operación',
                  },
                  ...usersMapped
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((member) => ({
                      value: member.name,
                      label: member.name,
                    })),
                ]}
                className="w-full p-2 mb-8 border border-gray-300 rounded"
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
              <p className="text-redAccent">{errors.punta_vendedora.message}</p>
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
      </div>
    </div>
  );
};

export default OperationsModal;
