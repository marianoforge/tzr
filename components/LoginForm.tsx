import { useState } from "react";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence, // Cambiar a browserLocalPersistence
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Input from "./FormComponents/Input";
import Button from "./FormComponents/Button";

const schema = yup.object().shape({
  email: yup.string().email("Correo inválido").required("Correo es requerido"),
  password: yup
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .required("Contraseña es requerida"),
});

interface LoginData {
  email: string;
  password: string;
}

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const onSubmit: SubmitHandler<LoginData> = async (data) => {
    try {
      await setPersistence(auth, browserLocalPersistence); // Cambiar a browserLocalPersistence
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Almacenar el token en localStorage
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("authToken", token);

      router.push("/dashboard");
    } catch {
      setFormError("Error al iniciar sesión, verifica tus credenciales.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md w-11/12 max-w-lg"
      >
        <h2 className="text-2xl mb-4 text-center">Iniciar Sesión</h2>
        {formError && <p className="text-red-500">{formError}</p>}
        <Input
          type="email"
          placeholder="Correo electrónico"
          {...register("email")}
          required
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            {...register("password")}
            className="w-full p-2 mb-4 border border-gray-300 rounded pr-10"
            required
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 pb-3 flex items-center text-sm leading-5"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        <Button type="submit">Iniciar Sesión</Button>
      </form>
    </div>
  );
};

export default LoginForm;
