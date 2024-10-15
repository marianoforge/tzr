// RegisterForm.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ModalOK from "@/components/TrackerComponents/ModalOK";
import { cleanString } from "@/utils/cleanString";
import Input from "@/components/TrackerComponents/FormComponents/Input";
import Button from "@/components/TrackerComponents/FormComponents/Button";
import { RegisterData } from "@/types";
import { createSchema } from "@/schemas/registerFormSchema";
import Link from "next/link";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const RegisterForm = () => {
  const router = useRouter();
  const { googleUser, email, uid, priceId } = router.query; // Capturar priceId directamente de la query
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [formError, setFormError] = useState("");

  const schema = createSchema(googleUser === "true");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterData>({
    resolver: yupResolver(schema) as Resolver<RegisterData>,
  });

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "GET",
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error);
      }
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (googleUser === "true" && email) {
      setValue("email", email as string);
    }
  }, [googleUser, email, setValue]);

  const onSubmit: SubmitHandler<RegisterData> = async (data) => {
    setLoading(true);
    if (!csrfToken) {
      setFormError("No se pudo obtener el token CSRF, intenta nuevamente.");
      setLoading(false);
      return;
    }

    try {
      // 1. Registrar el usuario
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken || "",
        },
        body: JSON.stringify({
          ...data,
          agenciaBroker: cleanString(data.agenciaBroker),
          googleUser: googleUser === "true",
          uid: googleUser === "true" ? uid : undefined,
          priceId: priceId || null, // Si hay un priceId, lo usamos, de lo contrario null
          // trialEndsAt solo si NO está comprando una licencia (sin priceId)
          ...(priceId
            ? {}
            : { trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }),
          password: googleUser !== "true" ? data.password : undefined,
          confirmPassword:
            googleUser !== "true" ? data.confirmPassword : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar usuario");
      }

      if (priceId) {
        // 2. Si se seleccionó una licencia, crear la sesión de Stripe y redirigir
        const stripeRes = await fetch("/api/checkout/checkout_session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId: priceId,
          }),
        });

        const { sessionId } = await stripeRes.json();
        const stripe = await stripePromise;

        if (sessionId) {
          const { error } = await stripe!.redirectToCheckout({ sessionId });
          if (error) {
            throw new Error(
              "Error en la redirección a Stripe: " + error.message
            );
          }
        } else {
          throw new Error("No se pudo obtener el sessionId para Stripe.");
        }
      } else {
        // 3. Si no seleccionaron licencia, terminar el registro y redirigir al dashboard
        setModalMessage("Registro exitoso. Ahora puedes iniciar sesión.");
        setIsModalOpen(true);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Ocurrió un error desconocido");
      }
    } finally {
      setLoading(false);
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
        className="bg-white p-6 shadow-md w-11/12 max-w-lg rounded-lg"
      >
        <h2 className="text-2xl mb-4 text-center">Regístrate</h2>
        {formError && <p className="text-red-500 mb-4">{formError}</p>}

        {/* Nombre */}
        <Input
          type="text"
          placeholder="Nombre"
          {...register("firstName")}
          required
        />
        {errors.firstName && (
          <p className="text-red-500">{errors.firstName.message}</p>
        )}

        {/* Apellido */}
        <Input
          type="text"
          placeholder="Apellido"
          {...register("lastName")}
          required
        />
        {errors.lastName && (
          <p className="text-red-500">{errors.lastName.message}</p>
        )}

        {/* Email */}
        <Input
          type="email"
          placeholder="Correo electrónico"
          {...register("email")}
          required
          readOnly={googleUser === "true"}
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        {/* Contraseñas solo si no es Google */}
        {googleUser !== "true" && (
          <>
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
          </>
        )}

        {/* Agencia / Broker */}
        <Input
          type="text"
          placeholder="Agencia / Broker"
          {...register("agenciaBroker")}
          required
        />
        {errors.agenciaBroker && (
          <p className="text-red-500">{errors.agenciaBroker.message}</p>
        )}

        {/* Número de Teléfono */}
        <Input
          type="tel"
          placeholder="Número de Teléfono"
          {...register("numeroTelefono")}
          required
        />
        {errors.numeroTelefono && (
          <p className="text-red-500">{errors.numeroTelefono.message}</p>
        )}

        {/* Selección del rol */}
        <select
          {...register("role")}
          className="block w-full mt-2 mb-4 p-2 border border-gray-300 rounded"
          required
        >
          <option value="" disabled selected>
            ¿Sos Team Leader / Broker o Asesor?
          </option>
          <option value="agente_asesor"> Asesor</option>
          <option value="team_leader_broker">Team Leader / Broker</option>
        </select>

        {/* Botón de registro */}
        <div className="flex flex-col gap-4 mt-6 sm:mt-0 sm:flex-row justify-center items-center sm:justify-around">
          <Button
            type="submit"
            disabled={loading}
            className="bg-greenAccent hover:bg-green-600 text-white py-2 px-4 rounded-md w-48"
          >
            {loading
              ? "Procesando..."
              : priceId
              ? "Comprar Licencia"
              : "Registrarse"}
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/login")}
            className="bg-mediumBlue hover:bg-blue-600 text-white py-2 px-4 rounded-md w-48"
          >
            Iniciar sesión
          </Button>
        </div>
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
