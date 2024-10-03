import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Input from "../../FormComponents/Input";
import Button from "../../FormComponents/Button";
import { Expense } from "@/types";
import { expenseTypes } from "./FormExpenses";

const schema = yup.object().shape({
  date: yup.string().required("La fecha es requerida"),
  amount: yup
    .number()
    .typeError("El monto debe ser un número")
    .positive("El monto debe ser positivo")
    .required("El monto es requerido"),
  dollarRate: yup
    .number()
    .typeError("La cotización debe ser un número")
    .positive("La cotización debe ser positiva")
    .required("La cotización del dólar es requerida"),
  expenseType: yup.string().required("El tipo de gasto es requerido"),
  description: yup.string().required("La descripción es requerida"),
  otherType: yup.string().nullable(),
  expenseAssociationType: yup.string().nullable(),
});

type FormData = yup.InferType<typeof schema>;

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: (Expense & { id?: string }) | null;
  onExpenseUpdate: (updatedExpense: Expense & { id: string }) => void; // Nueva prop para actualizar el gasto en la lista
}

const ExpensesModal: React.FC<ExpensesModalProps> = ({
  isOpen,
  onClose,
  expense,
  onExpenseUpdate, // Nueva prop para manejar la actualización
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: expense || {},
  });

  useEffect(() => {
    if (expense) {
      reset({
        ...expense,
        date: expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : "",
      });
    }
  }, [expense, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!expense?.id) {
      console.error("Expense ID is missing");
      return;
    }

    try {
      const response = await axios.put(`/api/expenses/${expense.id}`, data);
      if (response.status !== 200) {
        throw new Error("Error updating expense");
      }

      // Llamar a onExpenseUpdate para actualizar la lista en la interfaz
      onExpenseUpdate({
        ...data,
        id: expense.id,
        amountInDollars: data.amount / data.dollarRate,
        user_uid: expense.user_uid,
        otherType: data.otherType ?? "",
        expenseAssociationType: data.expenseAssociationType ?? "",
      });

      onClose(); // Cerrar el modal después de la edición exitosa
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center font-bold w-[50%] h-auto flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4">Editar Gasto</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Formulario de edición de gastos */}
          <Input
            type="date"
            {...register("date")}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          {errors.date && <p className="text-red-500">{errors.date.message}</p>}

          <Input
            type="number"
            placeholder="Monto"
            step="any"
            {...register("amount")}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          {errors.amount && (
            <p className="text-red-500">{errors.amount.message}</p>
          )}

          <Input
            type="number"
            placeholder="Cotización del dólar"
            step="any"
            {...register("dollarRate")}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          {errors.dollarRate && (
            <p className="text-red-500">{errors.dollarRate.message}</p>
          )}

          <Input
            type="text"
            placeholder="Descripción"
            {...register("description")}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}

          <select
            {...register("expenseType")}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            {expenseTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.expenseType && (
            <p className="text-red-500">{errors.expenseType.message}</p>
          )}

          {watch("expenseType") === "Otros" && (
            <Input
              type="text"
              placeholder="Especifica el tipo de gasto"
              {...register("otherType")}
              className="w-full p-2 border border-gray-300 rounded"
            />
          )}

          <div className="flex gap-4 justify-center items-center">
            <Button
              type="submit"
              className="bg-greenAccent text-white p-2 rounded hover:bg-greenAccent transition-all duration-300 font-semibold w-[30%]"
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

export default ExpensesModal;
