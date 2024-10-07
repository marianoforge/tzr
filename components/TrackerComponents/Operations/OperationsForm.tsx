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
import { Operation } from "@/types";

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

  const [userUID, setUserUID] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [honorariosBroker, setHonorariosBroker] = useState(0);
  const [honorariosAsesor, setHonorariosAsesor] = useState(0);

  const router = useRouter();
  const queryClient = useQueryClient();

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

  // Mutation to create a new operation using Tanstack Query
  const mutation = useMutation({
    mutationFn: createOperation, // Use the function to create an operation
    onSuccess: () => {
      if (userUID) {
        queryClient.invalidateQueries({ queryKey: ["operations", userUID] }); // Invalidate query to refresh operations list
      }
      setModalMessage("Operación guardada exitosamente");
      setShowModal(true);
      reset(); // Reset form after successful submission
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

    const dataToSubmit = {
      ...data,
      fecha_operacion: new Date(data.fecha_operacion).toISOString(),
      honorarios_broker: honorariosBroker,
      honorarios_asesor: honorariosAsesor,
      user_uid: userUID,
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
        className="p-6 bg-white rounded shadow-md w-full xl:w-[80%] 2xl:w-[70%]"
      >
        <h2 className="text-2xl mb-4">Agregar Operación</h2>
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2">
            {/* Left column */}
            <Input
              type="date"
              {...register("fecha_operacion")}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            {errors.fecha_operacion && (
              <p className="text-red-500">{errors.fecha_operacion.message}</p>
            )}

            <Input
              type="text"
              placeholder="Dirección de la Reserva"
              {...register("direccion_reserva")}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            {errors.direccion_reserva && (
              <p className="text-red-500">{errors.direccion_reserva.message}</p>
            )}

            <select
              {...register("tipo_operacion")}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
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

            <Input
              type="number"
              placeholder="Valor de Reserva"
              {...register("valor_reserva")}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            {errors.valor_reserva && (
              <p className="text-red-500">{errors.valor_reserva.message}</p>
            )}

            <div className="flex items-center justify-between">
              <Input
                placeholder="Porcentaje Punta Compradora"
                type="number"
                step="any"
                {...register("porcentaje_punta_compradora")}
                className="w-[45%] p-2 mb-4 border border-gray-300 rounded"
                required
              />
              {errors.porcentaje_punta_compradora && (
                <p className="text-red-500">
                  {errors.porcentaje_punta_compradora.message}
                </p>
              )}

              <Input
                placeholder="Porcentaje Punta Vendedora"
                type="number"
                step="any"
                {...register("porcentaje_punta_vendedora")}
                className="w-[45%] p-2 mb-4 border border-gray-300 rounded"
                required
              />
              {errors.porcentaje_punta_vendedora && (
                <p className="text-red-500">
                  {errors.porcentaje_punta_vendedora.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Input
                type="number"
                step="any"
                placeholder="Porcentaje Honorarios Asesor"
                {...register("porcentaje_honorarios_asesor")}
                className="w-[45%]  p-2 mb-4 border border-gray-300 rounded"
                required
              />
              {errors.porcentaje_honorarios_asesor && (
                <p className="text-red-500">
                  {errors.porcentaje_honorarios_asesor.message}
                </p>
              )}

              <Input
                type="number"
                step="any"
                placeholder="Porcentaje Honorarios Broker"
                {...register("porcentaje_honorarios_broker")}
                className="w-[45%] p-2 mb-4 border border-gray-300 rounded"
                required
              />
              {errors.porcentaje_honorarios_broker && (
                <p className="text-red-500">
                  {errors.porcentaje_honorarios_broker.message}
                </p>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2 px-2">
            {/* Right column */}
            <Input
              type="number"
              placeholder="Sobre de Reserva (opcional)"
              {...register("numero_sobre_reserva")}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            {errors.numero_sobre_reserva && (
              <p className="text-red-500">
                {errors.numero_sobre_reserva.message}
              </p>
            )}

            <Input
              type="number"
              placeholder="Sobre de Refuerzo (opcional)"
              {...register("numero_sobre_refuerzo")}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            {errors.numero_sobre_refuerzo && (
              <p className="text-red-500">
                {errors.numero_sobre_refuerzo.message}
              </p>
            )}

            <Input
              type="text"
              placeholder="Datos Referido (opcional)"
              {...register("referido")}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            {errors.referido && (
              <p className="text-red-500">{errors.referido.message}</p>
            )}

            <Input
              type="text"
              placeholder="Datos Compartido (opcional)"
              {...register("compartido")}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            {errors.compartido && (
              <p className="text-red-500">{errors.compartido.message}</p>
            )}

            <div className="flex justify-center items-center gap-10">
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
            className=" bg-[#7ED994] text-white p-2 rounded hover:bg-[#34D399] transition-all duration-300 font-semibold w-[200px]"
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
