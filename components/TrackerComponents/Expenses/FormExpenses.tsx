import React, { useState, useEffect } from "react";
import ModalOK from "@/components/TrackerComponents/ModalOK";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "@/components/TrackerComponents/FormComponents/Input";
import TextArea from "@/components/TrackerComponents/FormComponents/TextArea";
import Select from "@/components/TrackerComponents/FormComponents/Select"; // Select importado
import { Expense, ExpenseFormData } from "@/types";
import { useUserDataStore } from "@/stores/userDataStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "@/lib/api/expensesApi";
import { AxiosError } from "axios";

// Tipos de gastos
export const expenseTypes = [
  { value: "Fee (Franquicia)", label: "Fee (Franquicia)" },
  { value: "Carteleria", label: "Carteleria" },
  { value: "Marketing", label: "Marketing" },
  { value: "Varios", label: "Varios" },
  { value: "Contador", label: "Contador" },
  { value: "Matricula", label: "Matricula" },
  { value: "ABAO", label: "ABAO" },
  { value: "Fianza", label: "Fianza" },
  { value: "Alquiler Oficina", label: "Alquiler Oficina" },
  { value: "Portales Inmobiliarios", label: "Portales Inmobiliarios" },
  { value: "CRM", label: "CRM" },
  { value: "Viaticos", label: "Viaticos" },
  { value: "Expensas", label: "Expensas" },
  { value: "Otros", label: "Otros" },
];

const FormularioExpenses: React.FC = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [expenseAssociationType, setExpenseAssociationType] = useState("agent");
  const [userRole, setUserRole] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const role = userData?.role;

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setUserRole(role ?? null);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setModalMessage("Error fetching user role");
        setIsModalOpen(true);
      }
    };
    if (userID) {
      fetchUserRole();
    }
  }, [userID]);

  const schema = yup.object().shape({
    expenseType: yup.string().required(),
    date: yup.string().required("La fecha es requerida"),
    amount: yup.number().required("El monto es requerido").positive(),
    dollarRate: yup
      .number()
      .positive()
      .required("La cotización del dólar es requerida"),
    description: yup.string(),
    otherType: yup
      .string()
      .when("expenseType", ([expenseType], schema: yup.StringSchema) => {
        return expenseType === "Otros"
          ? schema.required("Debes especificar el tipo de gasto")
          : schema;
      }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(schema),
  });

  const selectedExpenseType = watch("expenseType");
  const amount = watch("amount");
  const dollarRate = watch("dollarRate");

  const mutation = useMutation({
    mutationFn: (expenseData: Expense) => createExpense(expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setModalMessage("Gasto guardado exitosamente");
      setIsModalOpen(true);
      reset();
    },
    onError: (error) => {
      const axiosError = error as AxiosError;
      console.error(
        "Mutation error:",
        axiosError.response?.data || axiosError.message
      );
    },
  });

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
      description: data.description ?? "",
      dollarRate: data.dollarRate,
      user_uid: userID ?? "",
      expenseAssociationType,
    };

    mutation.mutate(expenseData);
  };

  const amountInDollars =
    amount && dollarRate ? (amount / dollarRate).toFixed(2) : 0;

  // Example usage of setExpenseAssociationType
  const handleAssociationTypeChange = (newType: string) => {
    setExpenseAssociationType(newType);
  };

  return (
    <div className="flex flex-col justify-center items-center mt-20">
      {userRole ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 bg-white rounded-lg shadow-md w-full xl:w-[80%] 2xl:w-[70%]"
        >
          <h2 className="text-2xl mb-4 font-semibold">Registrar Gasto</h2>

          {userRole === "team_leader_broker" && (
            <Select
              label="Asociación del Gasto"
              options={[
                {
                  value: "team_broker",
                  label: "Gasto Asociado al Team / Broker",
                },
                { value: "agent", label: "Gasto Asociado como Asesor" },
              ]}
              register={register}
              name="expenseAssociationType"
              className="w-full p-2 border"
              required
              onChange={(e) => handleAssociationTypeChange(e.target.value)}
            />
          )}

          <Input
            label="Fecha del Gasto"
            type="date"
            {...register("date")}
            error={errors.date?.message}
            required
          />

          <Input
            label="Monto"
            type="number"
            placeholder="1000000"
            {...register("amount")}
            error={errors.amount?.message}
            required
          />

          <div className="flex gap-4 items-center">
            <div className="w-1/2">
              <Input
                label="Cotización del Dólar"
                type="number"
                placeholder="1250"
                {...register("dollarRate")}
                error={errors.dollarRate?.message}
                required
              />
            </div>
            <div className="w-1/2 ">
              <Input
                label="Monto en Dólares"
                type="text"
                value={amountInDollars}
                readOnly
                className="bg-gray-100 cursor-not-allowed p-2 rounded-lg"
              />
            </div>
          </div>

          <Select
            label="Tipo de Gasto"
            options={expenseTypes}
            register={register}
            name="expenseType"
            required
            mb="mb-4"
          />
          {errors.expenseType && (
            <p className="text-red-500">{errors.expenseType.message}</p>
          )}

          {selectedExpenseType === "Otros" && (
            <Input
              label="Especifica el tipo de gasto"
              type="text"
              {...register("otherType")}
              error={errors.otherType?.message}
            />
          )}

          <TextArea
            label="Descripción"
            {...register("description")}
            error={errors.description?.message}
          />

          <div className="flex justify-center items-center mt-8 w-full">
            <button
              type="submit"
              className="text-white p-2 rounded bg-mediumBlue hover:bg-lightBlue transition-all duration-300 font-semibold w-[200px]"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      ) : (
        <p>Loading...</p>
      )}
      <ModalOK
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
        onAccept={() => router.push("/expenses")}
      />
    </div>
  );
};

export default FormularioExpenses;
