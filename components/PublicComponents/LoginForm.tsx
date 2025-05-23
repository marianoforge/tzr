import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

import { useAuthStore } from '@/stores/authStore';
import { schema } from '@/common/schemas/loginFormSchema';
import { LoginData } from '@/common/types';
import { auth, db } from '@/lib/firebase';
import { PRICE_ID_GROWTH, PRICE_ID_GROWTH_ANNUAL } from '@/lib/data';

import Button from '../PrivateComponente/FormComponents/Button';
import Input from '../PrivateComponente/FormComponents/Input';
import Modal from '../PrivateComponente/CommonComponents/Modal';

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();

  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const { getAuthToken } = useAuthStore();

  const onSubmit: SubmitHandler<LoginData> = async (data) => {
    setLoading(true);
    setIsModalOpen(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, 'usuarios', user.uid);

      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.warn('⚠️ User document not found, redirecting to register...');
        router.push({
          pathname: '/register',
          query: { email: user.email, googleUser: 'false', uid: user.uid },
        });

        return;
      }

      const token = await getAuthToken();

      if (!token) {
        throw new Error('User not authenticated');
      }

      const sessionId = userDoc.data()?.sessionId;
      const existingCustomerId = userDoc.data()?.stripeCustomerId;
      const existingSubscriptionId = userDoc.data()?.stripeSubscriptionId;

      // Si no hay sessionId y no hay suscripción, mostrar modal
      if (!sessionId && (!existingCustomerId || !existingSubscriptionId)) {
        setLoading(false);
        setIsModalOpen(false);
        setIsSubscriptionModalOpen(true);
        return;
      }

      // Si hay sessionId, intentar recuperar y actualizar los datos de stripe
      if (sessionId && (!existingCustomerId || !existingSubscriptionId)) {
        try {
          const res = await fetch(`/api/checkout/${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            throw new Error(`Error en la API de checkout: ${res.status}`);
          }

          const session = await res.json();

          const stripeCustomerId = session.customer;
          const stripeSubscriptionId = session.subscription;

          if (!stripeCustomerId || !stripeSubscriptionId) {
            throw new Error('No se encontraron datos de suscripción válidos');
          }

          const priceId = userDoc.data().priceId;
          let role = 'agente_asesor';

          if (
            priceId === PRICE_ID_GROWTH ||
            priceId === PRICE_ID_GROWTH_ANNUAL
          ) {
            role = 'team_leader_broker';
          }

          const updateResponse = await fetch(`/api/users/updateUser`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: user.uid,
              stripeCustomerId,
              stripeSubscriptionId,
              role,
            }),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(
              `Error actualizando usuario: ${updateResponse.status} - ${errorData.message || 'Unknown error'}`
            );
          }

          await updateResponse.json();
        } catch (error) {
          console.error('❌ Error in subscription process:', error);
          setFormError(
            error instanceof Error
              ? error.message
              : 'Error en el proceso de suscripción'
          );
          setLoading(false);
          setIsModalOpen(false);
          setIsSubscriptionModalOpen(true);
          return;
        }
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('❌ Error in login process:', err);
      if (err instanceof Error) {
        // Check if the error message is from our API
        if (
          err.message.includes('Email no registrado') ||
          err.message.includes('Contraseña incorrecta')
        ) {
          setFormError(err.message);
        } else {
          setFormError('Error al iniciar sesión, verifica tus credenciales.');
        }
      } else {
        setFormError('Error al iniciar sesión, verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleSubscriptionModalClose = () => {
    setIsSubscriptionModalOpen(false);
  };

  return (
    <>
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
          className="bg-white p-6 rounded-lg shadow-md w-11/12 max-w-lg"
        >
          <h2 className="text-2xl mb-4 text-center font-semibold">
            Iniciar Sesión
          </h2>
          {formError && <p className="text-red-500 mb-4">{formError}</p>}

          {/* Email and Password Fields */}
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="juanaperez@gmail.com"
            {...register('email')}
            error={errors.email?.message}
            required
          />

          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            {...register('password')}
            error={errors.password?.message}
            required
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
            isPasswordVisible={showPassword}
          />

          <Link
            href="/reset-password"
            className="text-mediumBlue hover:underline block text-right text-sm pr-2 -mt-4 font-semibold"
          >
            Recuperar Contraseña
          </Link>

          <div className="flex flex-col gap-4 justify-center sm:justify-around items-center sm:flex-row  mt-6">
            <Button
              type="submit"
              className="bg-mediumBlue hover:bg-mediumBlue/90 text-white py-2 px-4 rounded-md w-[200px] text-sm"
              id="loginButton"
              data-testid="login-button"
            >
              Iniciar Sesión con Email
            </Button>
          </div>

          <hr className="hidden sm:block sm:my-4" />
          <div className="flex flex-col gap-4 mt-4 justify-center items-center sm:flex-row sm:mt-0 ">
            <Link
              href="/register"
              className="text-mediumBlue hover:underline mt-1 block text-right text-sm pr-2 font-semibold"
            >
              ¿No tienes cuenta? - Regístrate
            </Link>
          </div>
        </form>
      </div>

      {!loading && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title=""
          message="Entrando a RealtorTrackPro..."
        />
      )}

      <Modal
        isOpen={isSubscriptionModalOpen}
        onClose={handleSubscriptionModalClose}
        title="Suscripción Requerida"
        message="No se ha encontrado una suscripción activa para tu cuenta. Por favor, haz click en el link proporcionado en el email para activar tu suscripción."
        className="w-[360px] md:w-[700px] xl:w-auto h-auto"
      />
    </>
  );
};

export default LoginForm;
