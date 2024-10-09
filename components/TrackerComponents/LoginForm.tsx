import { useState } from "react";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  auth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  db,
} from "@/lib/firebase"; // Import Firebase Auth
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Importar Firestore para verificar el usuario
import Button from "@/components/TrackerComponents/FormComponents/Button";
import Input from "@/components/TrackerComponents/FormComponents/Input";
import { schema } from "@/schemas/loginFormSchema";
import { LoginData } from "@/types";
import Link from "next/link";
import Image from "next/image";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const router = useRouter();
  const [formError, setFormError] = useState("");

  // Iniciar sesión con correo y contraseña usando Firebase
  const onSubmit: SubmitHandler<LoginData> = async (data) => {
    try {
      // Utilizamos Firebase Auth para iniciar sesión con correo y contraseña
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      // Verificamos si el usuario está en Firestore
      const userDocRef = doc(db, "usuarios", user.uid); // Usamos el UID del usuario
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Si el usuario no existe en Firestore, redirigirlo al formulario de registro
        router.push({
          pathname: "/register",
          query: { email: user.email, googleUser: "false", uid: user.uid },
        });
      } else {
        // Si el usuario existe, redirigir al dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Error desconocido al iniciar sesión.");
      }
    }
  };

  // Iniciar sesión con Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;

      // Verificar si el usuario ya existe en Firestore
      const userDocRef = doc(db, "usuarios", user.uid); // Usamos el UID de Firebase
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Si el usuario no existe, redirigir al formulario de registro para completar los datos
        router.push({
          pathname: "/register",
          query: { email: user.email, googleUser: "true", uid: user.uid },
        });
      } else {
        // Si el usuario ya existe, simplemente redirige al dashboard
        router.push("/dashboard");
      }
    } catch {
      setFormError("Error al iniciar sesión con Google");
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen rounded-xl ring-1 ring-black/5 bg-gradient-to-r from-lightBlue via-mediumBlue to-darkBlue">
      <div className="flex items-center justify-center lg:justify-start">
        <Link href="/" title="Home">
          <Image
            src="/trackProLogoNoBg.png"
            alt="Logo"
            width={150}
            height={150}
            className="w-80"
          />
        </Link>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-11/12 max-w-lg"
      >
        <h2 className="text-2xl mb-4 text-center">Iniciar Sesión</h2>
        {formError && <p className="text-red-500 mb-4">{formError}</p>}

        {/* Email and Password Fields */}
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
        <div className="flex justify-between">
          <Button
            type="submit"
            className="bg-mediumBlue hover:bg-blue-600 text-white py-2 px-4 rounded-md w-58"
          >
            Iniciar Sesión con Email
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/register")}
            className="bg-greenAccent hover:bg-green-600 text-white py-2 px-4 rounded-md w-58"
          >
            Registrarse con Email
          </Button>
        </div>

        {/* Google Login Button */}
        <hr className="my-4" />
        <Button
          type="button"
          onClick={handleGoogleLogin}
          className="bg-redAccent hover:bg-red-600 text-white py-2 px-4 rounded-md w-58"
        >
          Iniciar sesión con Google
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
