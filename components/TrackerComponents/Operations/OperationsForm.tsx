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
import { Operation, UserData } from "@/types";
import useUsersWithOperations from "@/hooks/useUserWithOperations";
import { useUserDataStore } from "@/stores/userDataStore";

type FormData = InferType<typeof schema>;

const OperationsForm = ({ currentUser }: { currentUser: UserData }) => {
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
  const { data } = useUsersWithOperations(currentUser);

  const [userUID, setUserUID] = useState<string | null>(null);
  const { userData } = useUserDataStore();

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [honorariosBroker, setHonorariosBroker] = useState(0);
  const [honorariosAsesor, setHonorariosAsesor] = useState(0);

  const router = useRouter();
  const queryClient = useQueryClient();

  const userRole = userData?.role;
  const usersMapped = data?.map((user) => ({
    name: `${user.firstName} ${user.lastName}`,
    uid: user.uid,
  }));

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
      (user) => user.name === data.realizador_venta
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
    <div className="flex justify-center items-center w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white rounded shadow-md w-full xl:w-[80%] 2xl:w-[90%] justify-center items-center"
      >
        <h2 className="text-2xl mb-4 justify-center">
          Agregar Reserva / Operación
        </h2>
        <div className="flex flex-wrap -mx-2 gap-x-24 justify-center">
          <div className="w-50% md:w-[40%] px-2">
            {/* Left column */}
            <label className="font-semibold">Fecha de la Operación</label>
            <Input type="date" {...register("fecha_operacion")} required />
            {errors.fecha_operacion && (
              <p className="text-red-500">{errors.fecha_operacion.message}</p>
            )}
            <label className="font-semibold">
              Dirección de la reserva / operación
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
            <label className="font-semibold">Tipo de operación</label>
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
            <label className="font-semibold">
              Valor de reserva / operación
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

            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex flex-col w-[50%]">
                <label className="font-semibold">
                  Porcentaje punta compradora
                </label>
                <Input
                  placeholder="Por ejemplo: 3"
                  type="number"
                  step="any"
                  {...register("porcentaje_punta_compradora")}
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
                </label>
                <Input
                  placeholder="Por ejemplo: 4"
                  type="number"
                  step="any"
                  {...register("porcentaje_punta_vendedora")}
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
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="Por ejemplo: 40"
                  {...register("porcentaje_honorarios_asesor")}
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
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="Por ejemplo 7"
                  {...register("porcentaje_honorarios_broker")}
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
                  Número de sobre de refuerzo
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
                  type="number"
                  placeholder="Por ejemplo 10%"
                  {...register("porcentaje_referido")}
                />
                {errors.referido && (
                  <p className="text-red-500">{errors.referido.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-row w-full gap-2 justify-center items-center">
              <div>
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
              <div>
                <label className="font-semibold">Porcentaje Compartido</label>
                <Input
                  type="number"
                  placeholder="Por ejemplo: 25%"
                  {...register("porcentaje_compartido")}
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
                </label>
                <select
                  {...register("realizador_venta")}
                  className="w-full p-2 mb-8 border border-gray-300 rounded"
                  required
                >
                  <option value="">
                    Selecciona el asesor que realizó la venta
                  </option>
                  {usersMapped.map((user) => (
                    <option key={user.uid} value={user.name}>
                      {user.name}
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
            <label className="font-semibold">Cantidad de puntas</label>
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
        <div className="flex justify-center lg:justify-end items-center mt-8">
          <Button
            type="submit"
            className=" bg-greenAccent text-white p-2 rounded hover:bg-green-700 transition-all duration-300 font-semibold w-[200px]"
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
