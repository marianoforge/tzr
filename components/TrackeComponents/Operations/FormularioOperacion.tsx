import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ModalOK from "../ModalOK";
import { useRouter } from "next/router";
import axios from "axios";
import Input from "@/components/TrackeComponents/FormComponents/Input";
import Button from "@/components/TrackeComponents/FormComponents/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InferType } from "yup";
import { calculateHonorarios } from "@/utils/calculations";

const schema = yup.object().shape({
  fecha_operacion: yup.string().required("La fecha de operación es requerida"),
  direccion_reserva: yup
    .string()
    .required("La dirección de reserva es requerida"),
  tipo_operacion: yup.string().required("El tipo de operación es requerido"),
  valor_reserva: yup
    .number()
    .typeError("El valor de reserva debe ser un número")
    .positive("El valor de reserva debe ser positivo")
    .required("El valor de reserva es requerido"),
  porcentaje_honorarios_asesor: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("Porcentaje de honorarios asesor es requerido"),
  porcentaje_honorarios_broker: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .required("Porcentaje de honorarios broker es requerido"),
  porcentaje_punta_compradora: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo"),
  porcentaje_punta_vendedora: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo"),
  punta_compradora: yup.boolean().required(),
  punta_vendedora: yup.boolean().required(),
  numero_sobre_reserva: yup.number().typeError("Debe ser un número").nullable(),
  numero_sobre_refuerzo: yup
    .number()
    .typeError("Debe ser un número")
    .nullable(),
  referido: yup.string().nullable(),
  compartido: yup.string().nullable(),
  estado: yup.string().required("El estado es requerido"),
});

type FormData = InferType<typeof schema>;

const FormularioOperacion = () => {
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUID(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  const watchAllFields = watch();

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

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!userUID) {
      setModalMessage("Usuario no autenticado. Por favor, inicia sesión.");
      setShowModal(true);
      return;
    }

    try {
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

      await axios.post("/api/operations", dataToSubmit, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setModalMessage("Operación guardada exitosamente");
      setShowModal(true);
      reset();
      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setModalMessage(
          error.response.data.message || "Error al guardar la operación"
        );
      } else {
        setModalMessage("Error al guardar la operación");
      }
      setShowModal(true);
    }
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

export default FormularioOperacion;
