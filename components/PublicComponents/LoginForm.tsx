import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

import { schema } from '@/common/schemas/loginFormSchema';
import { LoginData } from '@/common/types';
import { auth, db } from '@/lib/firebase';

import Button from '../PrivateComponente/FormComponents/Button';
import Input from '../PrivateComponente/FormComponents/Input';
import ModalOK from '../PrivateComponente/CommonComponents/Modal';

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<LoginData> = async (data) => {
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
        router.push({
          pathname: '/register',
          query: { email: user.email, googleUser: 'false', uid: user.uid },
        });
      } else {
        const userData = userDoc.data();
        if (!userData.stripeSubscriptionId) {
          setOpenModal(true);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Error desconocido al iniciar sesión.');
      }
    }
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

      <ModalOK
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        message="No tienes una suscripción por favor envia un mail a info@realtortrackpro.com para que te envíen un link de pago"
        onAccept={() => setOpenModal(false)}
        className="w-[500px] h-[300px]"
      />
    </>
  );
};

export default LoginForm;
