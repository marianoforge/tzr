import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType } from "yup";
import Input from "@/components/TrackerComponents/FormComponents/Input";
import Select from "@/components/TrackerComponents/FormComponents/Select";
import Button from "@/components/TrackerComponents/FormComponents/Button";
import { calculateHonorarios } from "@/utils/calculations";
import { schema } from "@/schemas/operationsFormSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOperation } from "@/lib/api/operationsApi";
import { TeamMember, UserData } from "@/types";
import { useTeamMembers } from "@/hooks/useTeamMembers";

type FormData = InferType<typeof schema>;

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
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: operation || {},
  });

  const queryClient = useQueryClient();
  const { data: teamMembers } = useTeamMembers();

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
              "Logged User",
            uid: currentUser.uid,
          },
        ]
      : []),
  ];

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

  const mutation = useMutation({
    mutationFn: updateOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      onUpdate();
      onClose();
    },
    onError: (error) => {
      console.error("Error updating operation:", error);
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!operation?.id) {
      console.error("Operation ID is missing");
      return;
    }

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

    mutation.mutate({ id: operation.id, data: payload });
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
            label="Fecha de Operación"
            type="date"
            {...register("fecha_operacion")}
            error={errors.fecha_operacion?.message}
            required
          />

          <Input
            label="Dirección de la Reserva"
            type="text"
            {...register("direccion_reserva")}
            placeholder="Dirección de la Reserva"
            error={errors.direccion_reserva?.message}
            required
          />

          <Input
            label="Localidad de la Reserva"
            type="text"
            {...register("localidad_reserva")}
            placeholder="Por ejemplo: San Isidro"
            error={errors.localidad_reserva?.message}
            required
          />

          <Select
            label="Provincia de la Reserva"
            options={[
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
            register={register}
            name="provincia_reserva"
            error={errors.provincia_reserva?.message}
            required
          />

          <Select
            label="Tipo de Operación"
            options={[
              { value: "Venta", label: "Venta" },
              { value: "Alquiler temporal", label: "Alquiler temporal" },
              { value: "Alquiler", label: "Alquiler" },
              { value: "Alquiler Comercial", label: "Alquiler Comercial" },
              { value: "Fondo de Comercio", label: "Fondo de Comercio" },
              { value: "Desarrollo", label: "Desarrollo Inmobiliario" },
            ]}
            register={register}
            name="tipo_operacion"
            error={errors.tipo_operacion?.message}
          />

          <Input
            label="Valor de Reserva"
            type="number"
            {...register("valor_reserva")}
            placeholder="Valor de Reserva"
            error={errors.valor_reserva?.message}
            required
          />

          <Input
            label="Porcentaje Punta Compradora"
            type="text"
            step="any"
            {...register("porcentaje_punta_compradora", {
              setValueAs: (value) => parseFloat(value) || 0,
            })}
            error={errors.porcentaje_punta_compradora?.message}
            required
          />

          <Input
            label="Porcentaje Punta Vendedora"
            type="text"
            step="any"
            {...register("porcentaje_punta_vendedora", {
              setValueAs: (value) => parseFloat(value) || 0,
            })}
            error={errors.porcentaje_punta_vendedora?.message}
            required
          />

          <Input
            label="Porcentaje Honorarios Asesor"
            type="text"
            step="any"
            {...register("porcentaje_honorarios_asesor", {
              setValueAs: (value) => parseFloat(value) || 0,
            })}
            error={errors.porcentaje_honorarios_asesor?.message}
            required
          />

          <Input
            label="Porcentaje Honorarios Broker"
            type="text"
            step="any"
            {...register("porcentaje_honorarios_broker", {
              setValueAs: (value) => parseFloat(value) || 0,
            })}
            error={errors.porcentaje_honorarios_broker?.message}
            required
          />

          <Input
            label="Sobre de Reserva"
            type="text"
            {...register("numero_sobre_reserva")}
            placeholder="Sobre de Reserva"
            error={errors.numero_sobre_reserva?.message}
          />

          <Input
            label="Monto Sobre de Reserva"
            type="text"
            {...register("monto_sobre_reserva")}
            placeholder="Por ejemplo: 2000"
            error={errors.monto_sobre_reserva?.message}
          />

          <Input
            label="Sobre de Refuerzo"
            type="text"
            {...register("numero_sobre_refuerzo")}
            placeholder="Sobre de Refuerzo"
            error={errors.numero_sobre_refuerzo?.message}
          />

          <Input
            label="Monto Sobre de Refuerzo"
            type="text"
            {...register("monto_sobre_refuerzo")}
            placeholder="Por ejemplo: 4000"
            error={errors.monto_sobre_refuerzo?.message}
          />

          <Input
            label="Datos Referido"
            type="text"
            {...register("referido")}
            placeholder="Datos Referido"
            error={errors.referido?.message}
          />

          <Input
            label="Porcentaje Referido"
            type="text"
            step="any"
            {...register("porcentaje_referido", {
              setValueAs: (value) => parseFloat(value) || 0,
            })}
            placeholder="Por ejemplo 10%"
            error={errors.porcentaje_referido?.message}
          />

          <Input
            label="Datos Compartido"
            type="text"
            {...register("compartido")}
            placeholder="Datos Compartido"
            error={errors.compartido?.message}
          />

          <Input
            label="Porcentaje Compartido"
            type="text"
            step="any"
            {...register("porcentaje_compartido", {
              setValueAs: (value) => parseFloat(value) || 0,
            })}
            placeholder="Por ejemplo: 25%"
            error={errors.porcentaje_compartido?.message}
          />

          <Select
            label="Asesor que realizó la venta"
            options={usersMapped.map((user) => ({
              value: user.name,
              label: user.name,
            }))}
            register={register}
            name="realizador_venta"
            error={errors.realizador_venta?.message}
            required
          />

          <div className="flex justify-around items-center ">
            <div className="flex items-center gap-2 my-4">
              <input type="checkbox" {...register("punta_vendedora")} />
              <label>Punta Vendedora</label>
            </div>
            {errors.punta_vendedora && (
              <p className="text-redAccent">{errors.punta_vendedora.message}</p>
            )}

            <div className="flex items-center gap-2 my-4">
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
