import { useState } from "react";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ModalOK from "@/components/TrackeComponents/ModalOK";
import { cleanString } from "@/utils/cleanString";
import Input from "@/components/TrackeComponents/FormComponents/Input";
import Button from "@/components/TrackeComponents/FormComponents/Button";

const schema = yup.object().shape({
  firstName: yup.string().required("Nombre es requerido"),
  lastName: yup.string().required("Apellido es requerido"),
  email: yup.string().email("Correo inválido").required("Correo es requerido"),
  password: yup
    .string()
    .min(8, "Contraseña debe tener al menos 6 caracteres")
    .required("Contraseña es requerida"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Las contraseñas no coinciden")
    .required("Confirmar contraseña es requerido"),
  agenciaBroker: yup.string().required("Agencia o Broker es requerido"),
  numeroTelefono: yup.string().required("Número de Teléfono es requerido"),
  role: yup.string().required("Rol es requerido"),
});

interface RegisterData {
  password: string;
  agenciaBroker: string;
  numeroTelefono: string;
  firstName: string;
  lastName: string;
  email: string;
}

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [formError, setFormError] = useState(""); // Agregar estado para errores del formulario
  const router = useRouter();

  const onSubmit: SubmitHandler<RegisterData> = async (data) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          agenciaBroker: cleanString(data.agenciaBroker),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar usuario");
      }

      setModalMessage("Registro exitoso. Ahora puedes iniciar sesión.");
      setIsModalOpen(true);
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message); // Usar setFormError para manejar errores
      } else {
        setFormError("Error desconocido al registrar usuario");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md  w-11/12 max-w-lg"
      >
        <h2 className="text-2xl mb-4 text-center">Regístrate</h2>
        {formError && <p className="text-red-500 mb-4">{formError}</p>}{" "}
        {/* Mostrar errores del formulario */}
        <Input
          type="text"
          placeholder="Nombre"
          {...register("firstName")}
          required
        />
        {errors.firstName && (
          <p className="text-red-500">{errors.firstName.message}</p>
        )}
        <Input
          type="text"
          placeholder="Apellido"
          {...register("lastName")}
          required
        />
        {errors.lastName && (
          <p className="text-red-500">{errors.lastName.message}</p>
        )}
        <Input
          type="email"
          placeholder="Correo electrónico"
          {...register("email")}
          required
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        <Input
          type="password"
          placeholder="Contraseña"
          {...register("password")}
          required
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}
        <Input
          type="password"
          placeholder="Repite la contraseña"
          {...register("confirmPassword")}
          required
        />
        {errors.confirmPassword && (
          <p className="text-red-500">{errors.confirmPassword.message}</p>
        )}
        <Input
          type="text"
          placeholder="Agencia / Broker"
          {...register("agenciaBroker")}
          required
        />
        {errors.agenciaBroker && (
          <p className="text-red-500">{errors.agenciaBroker.message}</p>
        )}
        <Input
          type="tel"
          placeholder="Número de Teléfono"
          {...register("numeroTelefono")}
          required
        />
        {errors.numeroTelefono && (
          <p className="text-red-500">{errors.numeroTelefono.message}</p>
        )}
        {/* Nuevo select agregado */}
        <select
          {...register("role")}
          className="block w-full mt-2 mb-4 p-2 border border-gray-300 rounded"
          required
        >
          <option value="" disabled selected>
            ¿Sos Team Leader / Broker o Agente / Asesor?
          </option>
          <option value="agente_asesor">Agente / Asesor</option>
          <option value="team_leader_broker">Team Leader / Broker</option>
        </select>
        <Button type="submit">Registrarse</Button>
      </form>
      <ModalOK
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
        onAccept={() => router.push("/login")}
      />
    </div>
  );
};

export default RegisterForm;
