import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType } from "yup";
import Input from "@/components/TrackerComponents/FormComponents/Input";
import Button from "@/components/TrackerComponents/FormComponents/Button";
import { calculateHonorarios } from "@/utils/calculations";
import { schema } from "@/schemas/operationsFormSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOperation } from "@/lib/api/operationsApi"; // API para actualizar la operación
import { UserData } from "@/types";
import useUsersWithOperations from "@/hooks/useUserWithOperations";

type FormData = InferType<typeof schema>;

interface OperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: (FormData & { id: string }) | null;
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
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: operation || {},
  });

  const queryClient = useQueryClient();
  const { data } = useUsersWithOperations(currentUser);

  const usersMapped = data?.map((user) => ({
    name: `${user.firstName} ${user.lastName}`,
  }));

  useEffect(() => {
    if (operation) {
      const formattedOperation = {
        ...operation,
        fecha_operacion: operation.fecha_operacion
          ? new Date(operation.fecha_operacion).toISOString().split("T")[0]
          : "",
        porcentaje_punta_compradora: operation.porcentaje_punta_compradora || 0,
        porcentaje_punta_vendedora: operation.porcentaje_punta_vendedora || 0,
      };
      reset(formattedOperation);
    }
  }, [operation, reset]);

  // Mutación para actualizar la operación
  const mutation = useMutation({
    mutationFn: updateOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] }); // Invalida las consultas de operaciones para recargar datos
      onUpdate(); // Llamar función de actualización
      onClose(); // Cerrar el modal
    },
    onError: (error) => {
      console.error("Error updating operation:", error);
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log("Form submitted", data); // Debugging log
    if (!operation?.id) {
      console.error("Operation ID is missing");
      return;
    }

    // Calcular los honorarios
    const { honorariosBroker, honorariosAsesor } = calculateHonorarios(
      data.valor_reserva,
      data.porcentaje_honorarios_asesor,
      data.porcentaje_honorarios_broker
    );

    const payload = {
      ...data,
      honorarios_broker: honorariosBroker,
      honorarios_asesor: honorariosAsesor,
    };

    // Ejecutar la mutación para actualizar la operación
    mutation.mutate({ id: operation.id, data: payload });
  };

  if (!isOpen || !operation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center font-bold w-[90%]  lg:w-[80%] xl:w-[40%] h-auto max-h-[90vh] overflow-y-auto flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4">Editar Operación</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="date"
            {...register("fecha_operacion")}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          {errors.fecha_operacion && (
            <p className="text-redAccent">{errors.fecha_operacion.message}</p>
          )}

          <Input
            type="text"
            placeholder="Dirección de la Reserva"
            {...register("direccion_reserva")}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          {errors.direccion_reserva && (
            <p className="text-red-500">{errors.direccion_reserva.message}</p>
          )}
          <Input
            type="text"
            placeholder="Por ejemplo: San Isidro"
            {...register("localidad_reserva")}
            required
          />
          {errors.localidad_reserva && (
            <p className="text-red-500">{errors.localidad_reserva.message}</p>
          )}

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
          <select
            {...register("tipo_operacion")}
            className="w-full p-2 border border-gray-300 rounded"
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
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          {errors.valor_reserva && (
            <p className="text-redAccent">{errors.valor_reserva.message}</p>
          )}

          <div className="flex space-x-4">
            <Input
              placeholder="Porcentaje Punta Compradora"
              type="number"
              step="any"
              {...register("porcentaje_punta_compradora")}
              className="w-1/2 p-2 border border-gray-300 rounded"
              required
            />
            {errors.porcentaje_punta_compradora && (
              <p className="text-redAccent">
                {errors.porcentaje_punta_compradora.message}
              </p>
            )}

            <Input
              placeholder="Porcentaje Punta Vendedora"
              type="number"
              step="any"
              {...register("porcentaje_punta_vendedora")}
              className="w-1/2 p-2 border border-gray-300 rounded"
              required
            />
            {errors.porcentaje_punta_vendedora && (
              <p className="text-redAccent">
                {errors.porcentaje_punta_vendedora.message}
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <Input
              type="number"
              step="any"
              placeholder="Porcentaje Honorarios Asesor"
              {...register("porcentaje_honorarios_asesor")}
              className="w-1/2 p-2 border border-gray-300 rounded"
              required
            />
            {errors.porcentaje_honorarios_asesor && (
              <p className="text-redAccent">
                {errors.porcentaje_honorarios_asesor.message}
              </p>
            )}

            <Input
              type="number"
              step="any"
              placeholder="Porcentaje Honorarios Broker"
              {...register("porcentaje_honorarios_broker")}
              className="w-1/2 p-2 border border-gray-300 rounded"
              required
            />
            {errors.porcentaje_honorarios_broker && (
              <p className="text-redAccent">
                {errors.porcentaje_honorarios_broker.message}
              </p>
            )}
          </div>

          <Input
            type="text"
            placeholder="Sobre de Reserva"
            {...register("numero_sobre_reserva")}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.numero_sobre_reserva && (
            <p className="text-redAccent">
              {errors.numero_sobre_reserva.message}
            </p>
          )}

          <Input
            type="text"
            placeholder="Por ejemplo: 2000"
            {...register("monto_sobre_reserva")}
          />
          {errors.monto_sobre_reserva && (
            <p className="text-red-500">{errors.monto_sobre_reserva.message}</p>
          )}

          <Input
            type="text"
            placeholder="Sobre de Refuerzo"
            {...register("numero_sobre_refuerzo")}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.numero_sobre_refuerzo && (
            <p className="text-redAccent">
              {errors.numero_sobre_refuerzo.message}
            </p>
          )}

          <Input
            type="text"
            placeholder="Por ejemplo: 4000"
            {...register("monto_sobre_refuerzo")}
          />
          {errors.monto_sobre_refuerzo && (
            <p className="text-red-500">
              {errors.monto_sobre_refuerzo.message}
            </p>
          )}

          <Input
            type="text"
            placeholder="Datos Referido"
            {...register("referido")}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.referido && (
            <p className="text-redAccent">{errors.referido.message}</p>
          )}

          <Input
            type="number"
            placeholder="Por ejemplo 10%"
            {...register("porcentaje_referido")}
          />
          {errors.referido && (
            <p className="text-red-500">{errors.referido.message}</p>
          )}

          <Input
            type="text"
            placeholder="Datos Compartido"
            {...register("compartido")}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.compartido && (
            <p className="text-redAccent">{errors.compartido.message}</p>
          )}

          <Input
            type="text"
            placeholder="Por ejemplo: 25%"
            {...register("porcentaje_compartido")}
          />
          {errors.porcentaje_compartido && (
            <p className="text-red-500">
              {errors.porcentaje_compartido.message}
            </p>
          )}
          <select
            {...register("realizador_venta")}
            className="w-full p-2 mb-8 border border-gray-300 rounded"
            required
          >
            <option value="">Selecciona el asesor que realizó la venta</option>
            {usersMapped.map((user) => (
              <option key={user.name} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.realizador_venta && (
            <p className="text-red-500">{errors.realizador_venta.message}</p>
          )}

          <div className="flex justify-around items-center">
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register("punta_vendedora")} />
              <label>Punta Vendedora</label>
            </div>
            {errors.punta_vendedora && (
              <p className="text-redAccent">{errors.punta_vendedora.message}</p>
            )}

            <div className="flex items-center gap-2 mb-8">
              <input type="checkbox" {...register("punta_compradora")} />
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
              className="bg-greenAccent text-white p-2 rounded hover:bg-green-700 transition-all duration-300 font-semibold w-[30%]"
            >
              Guardar
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-redAccent text-white p-2 rounded hover:bg-red-700 transition-all duration-300 font-semibold w-[30%]"
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
