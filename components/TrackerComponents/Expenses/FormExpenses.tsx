import React, { useState } from "react";
import ModalOK from "@/components/TrackerComponents/ModalOK";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "@/components/TrackerComponents/FormComponents/Input";
import TextArea from "@/components/TrackerComponents/FormComponents/TextArea";
import Button from "@/components/TrackerComponents/FormComponents/Button";
import { Expense, ExpenseFormData } from "@/types";
import { useUserDataStore } from "@/stores/userDataStore";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Importar useMutation
import { createExpense } from "@/lib/api/expensesApi"; // Función para crear gasto

// Tipos de gastos
export const expenseTypes = [
  "Fee (Franquicia)",
  "Carteleria",
  "Marketing",
  "Varios",
  "Contador",
  "Matricula",
  "ABAO",
  "Fianza",
  "Alquiler Oficina",
  "Portales Inmobiliarios",
  "CRM",
  "Viaticos",
  "Otros",
];

// Validación del formulario con Yup
const schema = yup.object().shape({
  expenseAssociationType: yup
    .string()
    .required("El tipo de gasto es requerido"),
  date: yup.string().required("La fecha es requerida"),
  amount: yup.number().required("El monto es requerido").positive(),
  amountInDollars: yup.number(),
  expenseType: yup.string().required("El tipo de gasto es requerido"),
  description: yup.string().required("La descripción es requerida"),
  otherType: yup
    .string()
    .when("expenseType", ([expenseType], schema: yup.StringSchema) => {
      return expenseType === "Otros"
        ? schema.required("Debes especificar el tipo de gasto")
        : schema;
    }),
  dollarRate: yup
    .number()
    .positive()
    .required("La cotización del dólar es requerida"),
});

const FormularioExpenses: React.FC = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [expenseAssociationType, setExpenseAssociationType] = useState("");

  const queryClient = useQueryClient(); // Instancia de QueryClient para manejar la caché

  // Formulario con react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(schema),
  });

  // Obtener el valor de los campos del formulario
  const selectedExpenseType = watch("expenseType");
  const amount = watch("amount");
  const dollarRate = watch("dollarRate");

  const handleExpenseAssociationTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setExpenseAssociationType(e.target.value);
    setValue("expenseAssociationType", e.target.value);
  };

  // Mutación para crear un nuevo gasto
  const mutation = useMutation({
    mutationFn: (expenseData: Expense) => createExpense(expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] }); // Pass an object with queryKey
      setModalMessage("Gasto guardado exitosamente");
      setIsModalOpen(true);
      reset(); // Reiniciar el formulario después de éxito
    },
    onError: (error) => {
      console.error("Error al registrar el gasto:", error);
      setModalMessage("Error al registrar el gasto");
      setIsModalOpen(true);
    },
  });

  // Manejo del envío del formulario
  const onSubmit: SubmitHandler<ExpenseFormData> = (data) => {
    if (!userID) {
      setModalMessage("No se proporcionó un ID de usuario válido");
      setIsModalOpen(true);
      return;
    }

    const amountInDollars =
      data.amount && data.dollarRate ? data.amount / data.dollarRate : 0;

    const expenseData: Expense = {
      date: data.date,
      amount: data.amount ?? 0,
      amountInDollars,
      otherType: data.otherType ?? "",
      expenseType: data.expenseType,
      description: data.description,
      dollarRate: data.dollarRate,
      user_uid: userID,
      expenseAssociationType: data.expenseAssociationType,
    };

    mutation.mutate(expenseData); // Usar la mutación para crear el gasto
  };

  const amountInDollars =
    amount && dollarRate ? (amount / dollarRate).toFixed(2) : 0;

  return (
    <div className="flex flex-col justify-center items-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white rounded shadow-md w-full xl:w-[80%] 2xl:w-[70%]"
      >
        <h2 className="text-2xl mb-4">Registrar Gasto</h2>

        {userData?.role === "team_leader_broker" && (
          <div className="mb-4">
            <label className="block ">Tipo de Gasto</label>
            <select
              value={expenseAssociationType}
              onChange={handleExpenseAssociationTypeChange}
              className="w-full p-2 border"
            >
              <option value="">Seleccione una opción</option>
              <option value="team_broker">
                Gasto Asociado al Team / Broker
              </option>
              <option value="agent">Gasto Asociado como Asesor</option>
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block ">Fecha del Gasto</label>
          <Input type="date" {...register("date")} required />
          {errors.date && <p className="text-red-500">{errors.date.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block ">Monto</label>
          <Input type="number" step="0.01" {...register("amount")} required />
          {errors.amount && (
            <p className="text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="mb-4 flex gap-4 items-center">
          <div className="w-1/2">
            <label className="block ">Cotización del Dólar</label>
            <Input
              type="number"
              step="0.01"
              {...register("dollarRate")}
              required
            />
            {errors.dollarRate && (
              <p className="text-red-500">{errors.dollarRate.message}</p>
            )}
          </div>
          <div className="w-1/2">
            <label className="block ">Monto en Dólares</label>
            <Input
              type="text"
              value={amountInDollars}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block ">Tipo de Gasto</label>
          <select {...register("expenseType")} className="w-full p-2 border">
            {expenseTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.expenseType && (
            <p className="text-red-500">{errors.expenseType.message}</p>
          )}
        </div>

        {selectedExpenseType === "Otros" && (
          <div className="mb-4">
            <label className="block ">Especifica el tipo de gasto</label>
            <Input type="text" {...register("otherType")} />
            {errors.otherType && (
              <p className="text-red-500">{errors.otherType.message}</p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block ">Descripción</label>
          <TextArea {...register("description")} />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="flex justify-center items-center mt-8">
          <Button
            type="submit"
            className="bg-[#7ED994] text-white p-2 rounded hover:bg-[#34D399] transition-all duration-300 font-semibold w-[200px]"
          >
            Guardar Gasto
          </Button>
        </div>

        <ModalOK
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          message={modalMessage}
          onAccept={() => router.push("/expenses")}
        />
      </form>
    </div>
  );
};

export default FormularioExpenses;