import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ModalOK from "../ModalOK";
import { useRouter } from "next/router";
import Input from "@/components/TrackerComponents/FormComponents/Input";
import Button from "@/components/TrackerComponents/FormComponents/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType } from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Import Tanstack Query
import { createOperation } from "@/lib/api/operationsApi"; // Import the createOperation function
import { calculateHonorarios } from "@/utils/calculations";
import { schema } from "@/schemas/operationsFormSchema";
import { Operation, TeamMember } from "@/types";
import { useUserDataStore } from "@/stores/userDataStore";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import Select from "@/components/TrackerComponents/FormComponents/Select";
import { toZonedTime } from "date-fns-tz";
import { formatISO } from "date-fns";
import { formatDateForUser } from "@/utils/formatDateForUser";

type FormData = InferType<typeof schema>;

const OperationsForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      estado: "En Curso",
      punta_compradora: false,
      punta_vendedora: false,
      fecha_operacion: "", // Set a default value for the date field
    },
  });

  const { data: teamMembers } = useTeamMembers();

  const [userUID, setUserUID] = useState<string | null>(null);
  const { userData } = useUserDataStore();

  const [userTimeZone, setUserTimeZone] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [honorariosBroker, setHonorariosBroker] = useState(0);
  const [honorariosAsesor, setHonorariosAsesor] = useState(0);

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
              `${userData?.firstName} ${userData?.lastName}` || "Logged User",
            uid: userUID,
          },
        ]
      : []),
  ];

  // Fetch the user ID from Firebase authentication
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
  const date = watch("fecha_operacion");

  // Debugging log
  console.log(`Watched fecha_operacion: ${date}`);

  const formattedDate = date ? formatDateForUser(date, userTimeZone) : "";

  // Calculate honorarios based on form values
  useEffect(() => {
    const valor_reserva = parseFloat(String(watchAllFields.valor_reserva)) || 0;
    const porcentaje_honorarios_asesor =
      parseFloat(String(watchAllFields.porcentaje_honorarios_asesor)) || 0;
    const porcentaje_honorarios_broker =
      parseFloat(String(watchAllFields.porcentaje_honorarios_broker)) || 0;

    const { honorariosBroker, honorariosAsesor } = calculateHonorarios(
      valor_reserva,
      porcentaje_honorarios_asesor,
      porcentaje_honorarios_broker
    );

    setHonorariosBroker(honorariosBroker);
    setHonorariosAsesor(honorariosAsesor);
  }, [
    watchAllFields.valor_reserva,
    watchAllFields.porcentaje_honorarios_asesor,
    watchAllFields.porcentaje_honorarios_broker,
  ]);

  const mutation = useMutation({
    mutationFn: createOperation,
    onSuccess: () => {
      if (userUID) {
        queryClient.invalidateQueries({ queryKey: ["operations", userUID] });
      }
      setModalMessage("Operación guardada exitosamente");
      setShowModal(true);
      reset();
    },
    onError: () => {
      setModalMessage("Error al guardar la operación");
      setShowModal(true);
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!userUID) {
      setModalMessage("Usuario no autenticado. Por favor, inicia sesión.");
      setShowModal(true);
      return;
    }

    // Convertimos la fecha ingresada a UTC
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = toZonedTime(new Date(data.fecha_operacion), userTimeZone);
    const utcDate = formatISO(zonedDate, { representation: "date" });

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
        : "";

    const dataToSubmit = {
      ...data,
      fecha_operacion: utcDate, // Usamos la fecha en UTC
      honorarios_broker: honorariosBroker,
      honorarios_asesor: honorariosAsesor,
      user_uid: assignedUserUID,
      user_uid_adicional: assignedUserUIDAdicional,
      teamId: userUID,
      punta_compradora: data.punta_compradora ? 1 : 0,
      punta_vendedora: data.punta_vendedora ? 1 : 0,
      estado: "En Curso",
      porcentaje_punta_compradora: data.porcentaje_punta_compradora || 0,
      porcentaje_punta_vendedora: data.porcentaje_punta_vendedora || 0,
    };

    // Ejecutamos la mutación para crear la operación
    mutation.mutate(dataToSubmit as unknown as Operation);
  };

  const handleModalAccept = () => {
    router.push("/dashboard");
  };

  const [showAdditionalAdvisor, setShowAdditionalAdvisor] = useState(false);

  const toggleAdditionalAdvisor = () => {
    setShowAdditionalAdvisor((prev) => !prev);
  };

  return (
    <div className="flex justify-center items-center w-full mt-20">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white rounded-lg shadow-md w-full xl:w-[80%] 2xl:w-[90%] justify-center items-center mb-20"
      >
        <h2 className="text-2xl mb-4 justify-center font-semibold">
          Agregar Reserva / Operación
        </h2>
        <div className="flex flex-wrap -mx-2 gap-x-24 justify-center">
          <div className="w-50% md:w-[40%] px-2">
            {/* Left column */}
            <Input
              label="Fecha de la Operación*"
              type="date"
              defaultValue={formattedDate} // Ensure this is a valid date string
              {...register("fecha_operacion")}
              error={errors.fecha_operacion?.message}
              required
            />

            <Input
              label="Dirección de la operación*"
              type="text"
              placeholder="Dirección de la Reserva"
              {...register("direccion_reserva")}
              error={errors.direccion_reserva?.message}
              required
            />

            <Input
              label="Localidad*"
              type="text"
              placeholder="Por ejemplo: San Isidro"
              {...register("localidad_reserva")}
              error={errors.localidad_reserva?.message}
              required
            />

            <Select
              label="Provincia*" // Add the missing label prop
              register={register} // Add the missing register prop
              {...register("provincia_reserva")}
              options={[
                { value: "", label: "Selecciona la Provincia" },
                { value: "Buenos Aires", label: "Buenos Aires" },
                { value: "CABA", label: "CABA" },
                { value: "Catamarca", label: "Catamarca" },
                { value: "Chaco", label: "Chaco" },
                { value: "Chubut", label: "Chubut" },
                { value: "Córdoba", label: "Córdoba" },
                { value: "Corrientes", label: "Corrientes" },
                { value: "Entre Ríos", label: "Entre Ríos" },
                { value: "Formosa", label: "Formosa" },
                { value: "Jujuy", label: "Jujuy" },
                { value: "La Pampa", label: "La Pampa" },
                { value: "La Rioja", label: "La Rioja" },
                { value: "Mendoza", label: "Mendoza" },
                { value: "Misiones", label: "Misiones" },
                { value: "Neuquén", label: "Neuquén" },
                { value: "Río Negro", label: "Río Negro" },
                { value: "Salta", label: "Salta" },
                { value: "San Juan", label: "San Juan" },
                { value: "San Luis", label: "San Luis" },
                { value: "Santa Cruz", label: "Santa Cruz" },
                { value: "Santa Fe", label: "Santa Fe" },
                { value: "Santiago del Estero", label: "Santiago del Estero" },
                { value: "Tierra del Fuego", label: "Tierra del Fuego" },
                { value: "Tucumán", label: "Tucumán" },
              ]}
              className="w-full p-2 mb-8 border border-gray-300 rounded"
              required
            />
            {errors.provincia_reserva && (
              <p className="text-red-500">{errors.provincia_reserva.message}</p>
            )}

            <Select
              label="Tipo de operación*" // Add the missing label prop
              register={register} // Add the missing register prop
              {...register("tipo_operacion")}
              options={[
                { value: "", label: "Selecciona el Tipo de Operación" },
                { value: "Venta", label: "Venta" },
                { value: "Alquiler Temporal", label: "Alquiler Temporal" },
                {
                  value: "Alquiler Tradicional",
                  label: "Alquiler Tradicional",
                },
                { value: "Alquiler Comercial", label: "Alquiler Comercial" },
                { value: "Fondo de Comercio", label: "Fondo de Comercio" },
                { value: "Desarrollo", label: "Desarrollo Inmobiliario" },
                { value: "Cochera", label: "Cochera" },
                { value: "Locales Comerciales", label: "Locales Comerciales" },
              ]}
              className="w-full p-2 mb-8 border border-gray-300 rounded"
              required
            />
            {errors.tipo_operacion && (
              <p className="text-red-500">{errors.tipo_operacion.message}</p>
            )}

            <Input
              label="Porcentaje punta compradora*"
              type="text"
              placeholder="Por ejemplo: 4%"
              {...register("porcentaje_punta_compradora", {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              error={errors.porcentaje_punta_compradora?.message}
              required
            />

            <Input
              label="Porcentaje punta vendedora*"
              type="text"
              placeholder="Por ejemplo: 3%"
              {...register("porcentaje_punta_vendedora", {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              error={errors.porcentaje_punta_vendedora?.message}
              required
            />

            <Input
              label="Porcentaje honorarios totales*"
              type="text"
              placeholder="Por ejemplo: 7%"
              {...register("porcentaje_honorarios_broker", {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              error={errors.porcentaje_honorarios_broker?.message}
              required
            />
            <Input
              label="Valor de reserva / operación*"
              type="number"
              placeholder="Por ejemplo: 200000"
              {...register("valor_reserva")}
              error={errors.valor_reserva?.message}
              required
            />
            <Input
              label="Número sobre de reserva"
              type="text"
              placeholder="Por ejemplo: E12549"
              {...register("numero_sobre_reserva")}
              error={errors.numero_sobre_reserva?.message}
            />

            <Input
              label="Monto sobre de reserva"
              type="number"
              placeholder="Por ejemplo: 2000"
              {...register("monto_sobre_reserva")}
              error={errors.monto_sobre_reserva?.message}
            />
          </div>

          <div className="w-full md:w-[40%] px-2">
            {/* Right column */}

            <Input
              label="Número sobre de refuerzo"
              type="text"
              placeholder="Por ejemplo: E12549"
              {...register("numero_sobre_refuerzo")}
              error={errors.numero_sobre_refuerzo?.message}
            />

            <Input
              label="Monto sobre refuerzo"
              type="number"
              placeholder="Por ejemplo: 4000"
              {...register("monto_sobre_refuerzo")}
              error={errors.monto_sobre_refuerzo?.message}
            />

            <Input
              label="Referido"
              type="text"
              placeholder="Por ejemplo: Juan Pérez"
              {...register("referido")}
              error={errors.referido?.message}
            />

            <Input
              label="Porcentaje Referido"
              type="text"
              placeholder="Por ejemplo: 25%"
              {...register("porcentaje_referido", {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              error={errors.porcentaje_referido?.message}
            />

            <Input
              label="Compartido"
              type="text"
              placeholder="Por ejemplo: Juana Pérez"
              {...register("compartido")}
              error={errors.compartido?.message}
            />

            <Input
              label="Porcentaje Compartido"
              type="text"
              placeholder="Por ejemplo: 2%"
              {...register("porcentaje_compartido", {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              error={errors.porcentaje_compartido?.message}
            />
            <p className="text-sm text-mutedBlue mb-5">
              <span className="font-bold">Importante:</span> Si sos Broker de
              una oficina o Team leader y comercializas propiedades, cuando
              cierras una operación con un asesor bajo tu liderazgo, o sea,
              compartida, primero te pones como asesor participante al 50% y
              agregas un asesor más con el porcentaje de ganancia de el. Ej: 55%
            </p>
            {userRole === "team_leader_broker" && (
              <>
                <Select
                  label="Asesor que realizó la venta"
                  register={register}
                  {...register("realizador_venta")}
                  options={[
                    {
                      value: "",
                      label: "Selecciona el asesor que realizó la operación",
                    },
                    ...usersMapped
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((member) => ({
                        value: member.name,
                        label: member.name,
                      })),
                  ]}
                  className="w-full p-2 mb-8 border border-gray-300 rounded"
                  required
                />
                {errors.realizador_venta && (
                  <p className="text-red-500">
                    {errors.realizador_venta.message}
                  </p>
                )}
              </>
            )}

            <Input
              label="Porcentaje honorarios asesor*"
              type="text"
              placeholder="Por ejemplo: 40%"
              {...register("porcentaje_honorarios_asesor", {
                setValueAs: (value) => parseFloat(value) || 0,
              })}
              error={errors.porcentaje_honorarios_asesor?.message}
              required
            />

            {/* Additional advisor input block */}
            {showAdditionalAdvisor && (
              <>
                <Select
                  label="Asesor adicional"
                  register={register}
                  {...register("realizador_venta_adicional")}
                  options={[
                    {
                      value: "",
                      label:
                        "Selecciona el asesor participante en la operación",
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
                  {...register("porcentaje_honorarios_asesor_adicional", {
                    setValueAs: (value) => parseFloat(value) || 0,
                  })}
                  error={errors.porcentaje_honorarios_asesor_adicional?.message}
                />
              </>
            )}
            {userRole === "team_leader_broker" && (
              <p
                className="text-lightBlue font-semibold text-sm mb-6 -mt-4 cursor-pointer"
                onClick={toggleAdditionalAdvisor}
              >
                {showAdditionalAdvisor
                  ? "Eliminar Segundo Asesor"
                  : "Agregar Otro Asesor"}
              </p>
            )}
            <label className="font-semibold text-mediumBlue">
              Cantidad de puntas*
            </label>
            <div className="flex gap-10 mt-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register("punta_vendedora")} />
                <label>Punta Vendedora</label>
              </div>
              {errors.punta_vendedora && (
                <p className="text-red-500">{errors.punta_vendedora.message}</p>
              )}

              <div className="flex items-center gap-2">
                <input type="checkbox" {...register("punta_compradora")} />
                <label>Punta Compradora</label>
              </div>
              {errors.punta_compradora && (
                <p className="text-red-500">
                  {errors.punta_compradora.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-8 w-full">
          <Button
            type="submit"
            className="bg-mediumBlue hover:bg-lightBlue text-white p-2 rounded transition-all duration-300 font-semibold w-[200px]"
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
    </div>
  );
};

export default OperationsForm;
