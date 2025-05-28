import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InferType } from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  const [modalMessage, setModalMessage] = useState('');
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
      setModalMessage('Operación guardada exitosamente');
      setShowModal(true);
      reset();
    },
    onError: () => {
      setModalMessage('Error al guardar la operación');
      setShowModal(true);
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!userUID) {
      setModalMessage('Usuario no autenticado. Por favor, inicia sesión.');
      setShowModal(true);
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
    <div className="flex justify-center items-center w-full mt-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white rounded-lg shadow-md w-full xl:w-[80%] 2xl:w-[90%] justify-center items-center mb-20"
      >
        <h2 className="text-2xl mb-6 text-center font-semibold text-[#0077b6]">
          Agregar Reserva / Operación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sección 1: Información General */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              1. INFORMACIÓN GENERAL
            </h4>

            <Input
              label="Fecha de Captación / Publicación"
              type="date"
              defaultValue={formattedDate}
              {...register('fecha_captacion')}
              error={errors.fecha_captacion?.message}
            />

            <Input
              label="Fecha de Reserva*"
              type="date"
              defaultValue={formattedDate}
              {...register('fecha_reserva')}
              error={errors.fecha_reserva?.message}
              required
            />

            <Input
              label="Fecha de Cierre"
              type="date"
              defaultValue={formattedDate}
              {...register('fecha_operacion')}
              error={errors.fecha_operacion?.message}
            />

            <Select
              label="Tipo de operación*"
              register={register}
              name="tipo_operacion"
              options={operationTypes}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            {errors.tipo_operacion && (
              <p className="text-red-500">{errors.tipo_operacion.message}</p>
            )}

            {watch('tipo_operacion') === 'Venta' && (
              <>
                <Select
                  label="Tipo de Inmueble*"
                  register={register}
                  name="tipo_inmueble"
                  options={propertyTypes}
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                  required
                />
                {errors.tipo_inmueble && (
                  <p className="text-red-500">{errors.tipo_inmueble.message}</p>
                )}
              </>
            )}

            <div className="mt-4">
              <label className="font-semibold text-mediumBlue block mb-2">
                Exclusividad de la Operación*
              </label>
              <div className="flex gap-10">
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register('exclusiva')} />
                  <label>Exclusiva</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register('no_exclusiva')} />
                  <label>No Exclusiva</label>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Ubicación */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              2. UBICACIÓN
            </h4>

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

          {/* Sección 3: Valores */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              3. VALORES
            </h4>

            <Input
              label="Valor de oferta / operación*"
              type="number"
              placeholder="Por ejemplo: 200000"
              {...register('valor_reserva')}
              error={errors.valor_reserva?.message}
              required
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
            />

            <Input
              label="Porcentaje honorarios totales*"
              type="text"
              value={`${porcentajeHonorariosBroker.toFixed(2)}%`}
              disabled
            />
          </div>

          {/* Sección 4: Reservas y Refuerzos */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              4. RESERVAS Y REFUERZOS
            </h4>

            <Input
              label="Tipo de reserva"
              type="text"
              placeholder="Por ejemplo: Sobre nº / Transferencia"
              {...register('numero_sobre_reserva')}
              error={errors.numero_sobre_reserva?.message}
            />

            <Input
              label="Monto de Reserva"
              type="number"
              placeholder="Por ejemplo: 2000"
              {...register('monto_sobre_reserva')}
              error={errors.monto_sobre_reserva?.message}
            />

            <Input
              label="Tipo de refuerzo"
              type="text"
              placeholder="Por ejemplo: Sobre nº / Transferencia"
              {...register('numero_sobre_refuerzo')}
              error={errors.numero_sobre_refuerzo?.message}
            />

            <Input
              label="Monto de refuerzo"
              type="number"
              placeholder="Por ejemplo: 4000"
              {...register('monto_sobre_refuerzo')}
              error={errors.monto_sobre_refuerzo?.message}
            />
          </div>

          {/* Sección 5: Comisiones y Puntas */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              5. COMISIONES Y PUNTAS
            </h4>

            <div className="mt-4">
              <label className="font-semibold text-mediumBlue block mb-2">
                Cantidad de puntas*
              </label>
              <div className="flex gap-10">
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register('punta_vendedora')} />
                  <label>Punta Vendedora</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register('punta_compradora')} />
                  <label>Punta Compradora</label>
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
            />
          </div>

          {/* Sección 6: Compartido y Referido */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              6. COMPARTIDO Y REFERIDO
            </h4>

            <Input
              label="Datos Referido"
              type="text"
              placeholder="Por ejemplo: Juan Pérez"
              {...register('referido')}
              error={errors.referido?.message}
            />

            <Input
              label="Porcentaje Referido"
              type="text"
              placeholder="Por ejemplo: 25%"
              {...register('porcentaje_referido', {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              error={errors.porcentaje_referido?.message}
            />

            <Input
              label="Datos Compartido"
              type="text"
              placeholder="Por ejemplo: Juana Pérez"
              {...register('compartido')}
              error={errors.compartido?.message}
            />

            <Input
              label="Porcentaje Compartido"
              type="text"
              placeholder="Por ejemplo: 2%"
              {...register('porcentaje_compartido', {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              error={errors.porcentaje_compartido?.message}
            />
          </div>

          {/* Sección 7: Asesores */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              7. ASESORES
            </h4>

            {userRole === UserRole.TEAM_LEADER_BROKER && (
              <p className="text-sm text-mutedBlue mb-5">
                <span className="font-bold">Importante:</span> Si sos Broker de
                una oficina o Team leader y comercializas propiedades, en el
                siguiente input debes poner el porcentaje que se lleva la
                franquicia o el broker respectivamente para poder calcular el
                neto de tu operación de manera correcta.
              </p>
            )}

            <Input
              label="Porcentaje destinado a franquicia o broker"
              type="text"
              placeholder="Por ejemplo: 11%"
              {...register('isFranchiseOrBroker', {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              error={errors.isFranchiseOrBroker?.message}
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
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
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
            />

            {isTeamLeaderPrimaryAdvisor &&
              userRole === UserRole.TEAM_LEADER_BROKER && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">ℹ️ Información:</span>{' '}
                    Cuando el Team Leader participa se lleva el 100% del 50% del
                    bruto restante.
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
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
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
                  {...register('porcentaje_honorarios_asesor_adicional', {
                    setValueAs: (value) => parseFloat(value) || 0,
                  })}
                  error={errors.porcentaje_honorarios_asesor_adicional?.message}
                />

                {isTeamLeaderAdditionalAdvisor &&
                  userRole === UserRole.TEAM_LEADER_BROKER && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <p className="text-sm text-blue-700">
                        <span className="font-semibold">ℹ️ Información:</span>{' '}
                        Cuando el Team Leader participa se lleva el 100% del 50%
                        del bruto restante.
                      </p>
                    </div>
                  )}
              </>
            )}

            {userRole === UserRole.TEAM_LEADER_BROKER && (
              <div className="flex justify-between mt-4">
                <p
                  className="text-lightBlue font-semibold text-sm cursor-pointer"
                  onClick={toggleAdditionalAdvisor}
                >
                  {showAdditionalAdvisor
                    ? 'Eliminar asesor adicional'
                    : 'Agregar asesor adicional a la operación'}
                </p>
                <p
                  className="text-lightBlue font-semibold text-sm cursor-pointer"
                  onClick={() => setIsAddUserModalOpen(true)}
                >
                  Crear Asesor
                </p>
              </div>
            )}
          </div>

          {/* Sección 8: Observaciones */}
          <div className="md:col-span-2 space-y-4 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-[#0077b6] text-md border-b border-[#0077b6] pb-2 mb-3">
              8. INFORMACIÓN ADICIONAL
            </h4>

            <TextArea
              className="w-full"
              label="Observaciones"
              {...register('observaciones')}
              error={errors.observaciones?.message}
            />
          </div>
        </div>

        <div className="flex justify-center items-center mt-8 w-full">
          <Button
            type="submit"
            className="bg-[#0077b6] hover:bg-[#0077b6]/90 text-white p-2 rounded transition-all duration-300 font-semibold w-[200px]"
          >
            Guardar Operación
          </Button>
        </div>
      </form>

      <ModalOK
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
        onAccept={handleModalAccept}
      />

      {isAddUserModalOpen && (
        <AddUserModal onClose={() => setIsAddUserModalOpen(false)} />
      )}
    </div>
  );
};

export default OperationsForm;
