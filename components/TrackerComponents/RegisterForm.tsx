// RegisterForm.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';

import ModalOK from '@/components/TrackerComponents/ModalOK';
import { cleanString } from '@/utils/cleanString';
import Input from '@/components/TrackerComponents/FormComponents/Input';
import Button from '@/components/TrackerComponents/FormComponents/Button';
import { RegisterData } from '@/types';
import { createSchema } from '@/schemas/registerFormSchema';
import Select from '@/components/TrackerComponents/FormComponents/Select';
import LicensesModal from '../SiteComponents/LicensesModal';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const RegisterForm = () => {
  const router = useRouter();
  const { googleUser, email, uid } = router.query; // Capturar priceId directamente de la query
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar la visibilidad de la contraseña
  const [openLicensesModal, setOpenLicensesModal] = useState(false);

  const schema = createSchema(googleUser === 'true');
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
        const res = await fetch('/api/auth/register', {
          method: 'GET',
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Error al obtener el token CSRF:', error);
      }
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (googleUser === 'true' && email) {
      setValue('email', email as string);
    }
  }, [googleUser, email, setValue]);

  useEffect(() => {
    const storedPriceId = localStorage.getItem('selectedPriceId');
    if (!storedPriceId) {
      setOpenLicensesModal(true);
    }
  }, []);

  const onSubmit: SubmitHandler<RegisterData> = async (data) => {
    setLoading(true);
    if (!csrfToken) {
      setFormError('No se pudo obtener el token CSRF, intenta nuevamente.');
      setLoading(false);
      return;
    }

    try {
      const storedPriceId = localStorage.getItem('selectedPriceId');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({
          ...data,
          agenciaBroker: cleanString(data.agenciaBroker),
          googleUser: googleUser === 'true',
          uid: googleUser === 'true' ? uid : undefined,
          priceId: storedPriceId || null,
          ...(storedPriceId
            ? {}
            : { trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }),
          password: googleUser !== 'true' ? data.password : undefined,
          confirmPassword:
            googleUser !== 'true' ? data.confirmPassword : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar usuario');
      }

      if (storedPriceId) {
        const stripeRes = await fetch('/api/checkout/checkout_session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: storedPriceId,
          }),
        });

        const { sessionId } = await stripeRes.json();
        const stripe = await stripePromise;

        if (sessionId) {
          const { error } = await stripe!.redirectToCheckout({ sessionId });
          if (error) {
            throw new Error(
              'Error en la redirección a Stripe: ' + error.message
            );
          }
        } else {
          throw new Error('No se pudo obtener el sessionId para Stripe.');
        }
      } else {
        setModalMessage('Registro exitoso. Ahora puedes iniciar sesión.');
        setIsModalOpen(true);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Ocurrió un error desconocido');
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
            src="/trackproLogoWhite.png"
            alt="Logo"
            width={350}
            height={350}
          />
        </Link>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 shadow-md w-11/12 max-w-lg rounded-lg"
      >
        <h2 className="text-2xl mb-4 text-center">Regístrate</h2>
        {formError && (
          <p className="text-redAccent mb-4 text-center">{formError}</p>
        )}

        <Input
          label="Nombre"
          type="text"
          placeholder="Juan"
          {...register('firstName')}
          error={errors.firstName?.message}
          required
        />

        <Input
          label="Apellido"
          type="text"
          placeholder="Pérez"
          {...register('lastName')}
          error={errors.lastName?.message}
          required
        />

        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="juan@perez.com"
          {...register('email')}
          error={errors.email?.message}
          required
          readOnly={googleUser === 'true'}
        />

        {googleUser !== 'true' && (
          <>
            <Input
              label="Contraseña"
              type="password"
              placeholder="************"
              {...register('password')}
              error={errors.password?.message}
              required
              showPasswordToggle
              onTogglePassword={() => setShowPassword(!showPassword)}
              isPasswordVisible={showPassword}
            />

            <Input
              label="Repite la Contraseña"
              type="password"
              placeholder="************"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              required
              showPasswordToggle
              onTogglePassword={() => setShowPassword(!showPassword)}
              isPasswordVisible={showPassword}
            />
          </>
        )}

        <Input
          label="Agencia / Broker a la que perteneces"
          type="text"
          placeholder="Gustavo De Simone Soluciones Inmobiliarias"
          {...register('agenciaBroker')}
          error={errors.agenciaBroker?.message}
          required
        />

        <Input
          label="Número de Teléfono"
          type="tel"
          placeholder="+54 11 6348 8465"
          {...register('numeroTelefono')}
          error={errors.numeroTelefono?.message}
          required
        />

        <Select
          label="¿Sos Team Leader / Broker o Asesor?"
          options={[
            { value: 'agente_asesor', label: 'Asesor' },
            { value: 'team_leader_broker', label: 'Team Leader / Broker' },
          ]}
          register={register}
          name="role"
          required
        />

        {/* Botón de registro */}
        <div className="flex flex-col gap-4 sm:flex-row justify-center items-center sm:justify-around">
          <Button
            type="submit"
            disabled={loading}
            className="bg-lightBlue hover:bg-mediumBlue text-white py-2 px-4 mt-4 rounded-md w-48"
          >
            Registrarse
          </Button>
          <Button
            type="button"
            onClick={() => router.push('/login')}
            className="bg-mediumBlue hover:bg-lightBlue text-white py-2 px-4 mt-4 rounded-md w-48"
          >
            Iniciar sesión
          </Button>
        </div>
      </form>

      <ModalOK
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
        onAccept={() => router.push('/login')}
      />

      <LicensesModal
        isOpen={openLicensesModal}
        onClose={() => setOpenLicensesModal(false)}
      />
    </div>
  );
};

export default RegisterForm;
