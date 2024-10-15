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
    },
  });

  const { data: teamMembers } = useTeamMembers();

  const [userUID, setUserUID] = useState<string | null>(null);
  const { userData } = useUserDataStore();

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

  const watchAllFields = watch();

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

    // Determine the user UID to assign the operation to
    const selectedUser = usersMapped.find(
      (member: { name: string }) => member.name === data.realizador_venta
    );
    const assignedUserUID =
      selectedUser && selectedUser.uid !== userUID ? selectedUser.uid : userUID;

    const dataToSubmit = {
      ...data,
      fecha_operacion: new Date(data.fecha_operacion).toISOString(),
      honorarios_broker: honorariosBroker,
      honorarios_asesor: honorariosAsesor,
      user_uid: assignedUserUID, // Use the determined user UID
      punta_compradora: data.punta_compradora ? 1 : 0,
      punta_vendedora: data.punta_vendedora ? 1 : 0,
      estado: "En Curso",
      porcentaje_punta_compradora: data.porcentaje_punta_compradora || 0,
      porcentaje_punta_vendedora: data.porcentaje_punta_vendedora || 0,
    };

    // Execute the mutation to create the operation
    mutation.mutate(dataToSubmit as unknown as Operation);
  };

  const handleModalAccept = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex justify-center items-center w-full mt-20">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white rounded-lg shadow-md w-full xl:w-[80%] 2xl:w-[90%] justify-center items-center"
      >
        <h2 className="text-2xl mb-4 justify-center font-semibold">
          Agregar Reserva / Operación
        </h2>
        <div className="flex flex-wrap -mx-2 gap-x-24 justify-center">
          <div className="w-50% md:w-[40%] px-2">
            {/* Left column */}
            <label className="font-semibold">
              Fecha de la Operación<span className="text-redAccent">*</span>
            </label>
            <Input type="date" {...register("fecha_operacion")} required />
            {errors.fecha_operacion && (
              <p className="text-red-500">{errors.fecha_operacion.message}</p>
            )}
            <label className="font-semibold">
              Dirección de la operación<span className="text-redAccent">*</span>
            </label>
            <Input
              type="text"
              placeholder="Dirección de la Reserva"
              {...register("direccion_reserva")}
              required
            />
            {errors.direccion_reserva && (
              <p className="text-red-500">{errors.direccion_reserva.message}</p>
            )}
            <label className="font-semibold">
              Localidad<span className="text-redAccent">*</span>
            </label>
            <Input
              type="text"
              placeholder="Por ejemplo: San Isidro"
              {...register("localidad_reserva")}
              required
            />
            {errors.localidad_reserva && (
              <p className="text-red-500">{errors.localidad_reserva.message}</p>
            )}
            <label className="font-semibold">
              Provincia<span className="text-redAccent">*</span>
            </label>
            <select
              {...register("provincia_reserva")}
              className="w-full p-2 mb-8 border border-gray-300 rounded"
              required
            >
              <option value="">Selecciona la Provincia</option>
              <option value="Buenos Aires">Buenos Aires</option>
              <option value="CABA">CABA</option>
              <option value="Catamarca">Catamarca</option>
              <option value="Chaco">Chaco</option>
              <option value="Chubut">Chubut</option>
              <option value="Córdoba">Córdoba</option>
              <option value="Corrientes">Corrientes</option>
              <option value="Entre Ríos">Entre Ríos</option>
              <option value="Formosa">Formosa</option>
              <option value="Jujuy">Jujuy</option>
              <option value="La Pampa">La Pampa</option>
              <option value="La Rioja">La Rioja</option>
              <option value="Mendoza">Mendoza</option>
              <option value="Misiones">Misiones</option>
              <option value="Neuquén">Neuquén</option>
              <option value="Río Negro">Río Negro</option>
              <option value="Salta">Salta</option>
              <option value="San Juan">San Juan</option>
              <option value="San Luis">San Luis</option>
              <option value="Santa Cruz">Santa Cruz</option>
              <option value="Santa Fe">Santa Fe</option>
              <option value="Santiago del Estero">Santiago del Estero</option>
              <option value="Tierra del Fuego">Tierra del Fuego</option>
              <option value="Tucumán">Tucumán</option>
            </select>
            {errors.provincia_reserva && (
              <p className="text-red-500">{errors.provincia_reserva.message}</p>
            )}
            <label className="font-semibold">
              Tipo de operación<span className="text-redAccent">*</span>
            </label>
            <select
              {...register("tipo_operacion")}
              className="w-full p-2 mb-8 border border-gray-300 rounded"
              required
            >
              <option value="">Selecciona el Tipo de Operación</option>
              <option value="Venta">Venta</option>
              <option value="Alquiler temporal">Alquiler temporal</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Alquiler Comercial">Alquiler Comercial</option>
              <option value="Fondo de Comercio">Fondo de Comercio</option>
              <option value="Desarrollo">Desarrollo Inmobiliario</option>
            </select>
            {errors.tipo_operacion && (
              <p className="text-red-500">{errors.tipo_operacion.message}</p>
            )}

            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex flex-col w-[50%]">
                <label className="font-semibold">
                  Porcentaje punta compradora
                  <span className="text-redAccent">*</span>
                </label>
                <Input
                  placeholder="Por ejemplo: 3%"
                  type="text"
                  step="any"
                  {...register("porcentaje_punta_compradora", {
                    setValueAs: (value) => parseFloat(value) || 0, // Cast to number
                  })}
                  required
                />
                {errors.porcentaje_punta_compradora && (
                  <p className="text-red-500">
                    {errors.porcentaje_punta_compradora.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col w-[50%]">
                <label className="font-semibold">
                  Porcentaje punta vendedora
                  <span className="text-redAccent">*</span>
                </label>
                <Input
                  placeholder="Por ejemplo: 4%"
                  type="text"
                  step="any"
                  {...register("porcentaje_punta_vendedora", {
                    setValueAs: (value) => parseFloat(value) || 0, // Cast to number
                  })}
                  required
                />
                {errors.porcentaje_punta_vendedora && (
                  <p className="text-red-500">
                    {errors.porcentaje_punta_vendedora.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex flex-col w-[50%]">
                <label className="font-semibold">
                  Porcentaje honorarios asesor
                  <span className="text-redAccent">*</span>
                </label>
                <Input
                  type="text"
                  step="any"
                  placeholder="Por ejemplo: 40%"
                  {...register("porcentaje_honorarios_asesor", {
                    setValueAs: (value) => parseFloat(value) || 0, // Cast to number
                  })}
                  required
                />
                {errors.porcentaje_honorarios_asesor && (
                  <p className="text-red-500">
                    {errors.porcentaje_honorarios_asesor.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col w-[50%]">
                <label className="font-semibold">
                  Porcentaje honorarios totales
                  <span className="text-redAccent">*</span>
                </label>
                <Input
                  type="text"
                  step="any"
                  placeholder="Por ejemplo 7%"
                  {...register("porcentaje_honorarios_broker", {
                    setValueAs: (value) => parseFloat(value) || 0, // Cast to number
                  })}
                  required
                />
                {errors.porcentaje_honorarios_broker && (
                  <p className="text-red-500">
                    {errors.porcentaje_honorarios_broker.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-[40%] px-2">
            {/* Right column */}
            <label className="font-semibold">
              Valor de reserva / operación
              <span className="text-redAccent">*</span>
            </label>
            <Input
              type="number"
              placeholder="Por ejemplo: 200000"
              {...register("valor_reserva")}
              required
            />
            {errors.valor_reserva && (
              <p className="text-red-500">{errors.valor_reserva.message}</p>
            )}
            <div className="flex flex-row w-full gap-2 justify-center items-center">
              <div className="w-1/2">
                <label className="font-semibold">Número sobre de reserva</label>
                <Input
                  type="text"
                  placeholder="Por ejemplo: E12549"
                  {...register("numero_sobre_reserva")}
                />
                {errors.numero_sobre_reserva && (
                  <p className="text-red-500">
                    {errors.numero_sobre_reserva.message}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <label className="font-semibold">Monto sobre de reserva</label>
                <Input
                  type="number"
                  placeholder="Por ejemplo: 2000"
                  {...register("monto_sobre_reserva")}
                />
                {errors.monto_sobre_reserva && (
                  <p className="text-red-500">
                    {errors.monto_sobre_reserva.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-row w-full gap-2 justify-center items-center">
              <div className="w-1/2">
                <label className="font-semibold">
                  Número sobre de refuerzo
                </label>
                <Input
                  type="text"
                  placeholder="Por ejemplo: E12549"
                  {...register("numero_sobre_refuerzo")}
                />
                {errors.numero_sobre_refuerzo && (
                  <p className="text-red-500">
                    {errors.numero_sobre_refuerzo.message}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <label className="font-semibold">Monto sobre refuerzo</label>
                <Input
                  type="number"
                  placeholder="Por ejemplo: 4000"
                  {...register("monto_sobre_refuerzo")}
                />
                {errors.monto_sobre_refuerzo && (
                  <p className="text-red-500">
                    {errors.monto_sobre_refuerzo.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-row w-full gap-2 justify-center items-center">
              <div className="w-1/2">
                <label className="font-semibold">Referido</label>
                <Input
                  type="text"
                  placeholder="Por ejemplo: Juan Pérez"
                  {...register("referido")}
                />
                {errors.referido && (
                  <p className="text-red-500">{errors.referido.message}</p>
                )}
              </div>
              <div className="w-1/2">
                <label className="font-semibold">Porcentaje Referido</label>
                <Input
                  type="text" // Keep the input type as "text"
                  placeholder="Por ejemplo 25%"
                  {...register("porcentaje_referido", {
                    setValueAs: (value) => parseFloat(value) || 0, // Cast to number
                  })}
                />
                {errors.referido && (
                  <p className="text-red-500">{errors.referido.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-row w-full gap-2 justify-center items-center">
              <div className="w-1/2">
                <label className="font-semibold">Compartido</label>
                <Input
                  type="text"
                  placeholder="Por ejemplo: Juana Pérez"
                  {...register("compartido")}
                />
                {errors.compartido && (
                  <p className="text-red-500">{errors.compartido.message}</p>
                )}
              </div>
              <div className="w-1/2">
                <label className="font-semibold">Porcentaje Compartido</label>
                <Input
                  type="text"
                  placeholder="Por ejemplo: 2%"
                  {...register("porcentaje_compartido", {
                    setValueAs: (value) => parseFloat(value) || 0, // Cast to number
                  })}
                />
                {errors.porcentaje_compartido && (
                  <p className="text-red-500">
                    {errors.porcentaje_compartido.message}
                  </p>
                )}
              </div>
            </div>
            {userRole === "team_leader_broker" && (
              <>
                <label className="font-semibold">
                  Asesor que realizó la venta
                  <span className="text-redAccent">*</span>
                </label>
                <select
                  {...register("realizador_venta")}
                  className="w-full p-2 mb-8 border border-gray-300 rounded"
                  required
                >
                  <option value="">
                    Selecciona el asesor que realizó la venta
                  </option>
                  {usersMapped.map((member) => (
                    <option key={member.uid} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {errors.realizador_venta && (
                  <p className="text-red-500">
                    {errors.realizador_venta.message}
                  </p>
                )}
              </>
            )}
            <label className="font-semibold">Cantidad de puntas*</label>
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
