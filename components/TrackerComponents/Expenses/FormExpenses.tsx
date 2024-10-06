import React, { useState, useEffect } from "react";
import ModalOK from "@/components/TrackerComponents/ModalOK";
import { useRouter } from "next/router";
import { useAuthStore } from "@/stores/authStore";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Input from "@/components/TrackerComponents/FormComponents/Input";
import TextArea from "@/components/TrackerComponents/FormComponents/TextArea";
import { Expense, ExpenseFormData } from "@/types";
import { useUserDataStore } from "@/stores/userDataStore";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Importar useMutation
import { createExpense } from "@/lib/api/expensesApi"; // Función para crear gasto
import { AxiosError } from "axios";

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

const FormularioExpenses: React.FC = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [expenseAssociationType, setExpenseAssociationType] = useState("agent"); // Set default to "agent"
  const [userRole, setUserRole] = useState<string | null>(null); // State to store user role

  const queryClient = useQueryClient();

  const role = userData?.role;

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Assume this function fetches the role
        setUserRole(role ?? null); // Use null as a default value if role is undefined
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
    expenseAssociationType: yup.string(),
    date: yup.string().required("La fecha es requerida"),
    amount: yup.number().required("El monto es requerido").positive(),
    amountInDollars: yup.number(),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(schema),
    context: { role: userRole }, // Pass the fetched role to the validation context
  });

  // Obtener el valor de los campos del formulario
  const selectedExpenseType = watch("expenseType");
  const amount = watch("amount");
  const dollarRate = watch("dollarRate");

  const handleExpenseAssociationTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setExpenseAssociationType(e.target.value || "agent"); // Default to "agent" if no value is selected
    setValue("expenseAssociationType", e.target.value || "agent");
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
      const axiosError = error as AxiosError;
      console.error(
        "Mutation error:",
        axiosError.response?.data || axiosError.message
      );
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
      user_uid: userID ?? "",
      expenseAssociationType: data.expenseAssociationType ?? "",
    };

    mutation.mutate(expenseData, {
      onError: (error) => {
        const axiosError = error as AxiosError;
        console.error(
          "Mutation error:",
          axiosError.response?.data || axiosError.message
        );
      },
    });
  };

  const amountInDollars =
    amount && dollarRate ? (amount / dollarRate).toFixed(2) : 0;

  return (
    <div className="flex flex-col justify-center items-center">
      {userRole ? ( // Render form only if userRole is fetched
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 bg-white rounded shadow-md w-full xl:w-[80%] 2xl:w-[70%]"
        >
          <h2 className="text-2xl mb-4">Registrar Gasto</h2>

          {userRole === "team_leader_broker" && (
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
            {errors.date && (
              <p className="text-red-500">{errors.date.message}</p>
            )}
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
            <button
              type="submit" // Ensure the button type is submit
              className="bg-[#7ED994] text-white p-2 rounded hover:bg-[#34D399] transition-all duration-300 font-semibold w-[200px]"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      ) : (
        <p>Loading...</p> // Show loading state while fetching role
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
