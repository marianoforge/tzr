import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import Image from 'next/image';
import { nanoid } from 'nanoid';
import ReCAPTCHA from 'react-google-recaptcha';

import ModalOK from '@/components/PrivateComponente/CommonComponents/Modal';
import Input from '@/components/PrivateComponente/FormComponents/Input';
import Button from '@/components/PrivateComponente/FormComponents/Button';
import LicensesModal from '@/components/PublicComponents/LicensesModal';
import { RegisterData } from '@/common/types';
import { createSchema } from '@/common/schemas/registerFormSchema';
import { useCurrenciesForAmericas } from '@/common/hooks/useCurrenciesByRegion';
import Select from '@/components/PrivateComponente/CommonComponents/Select';

const RegisterForm = () => {
  const router = useRouter();
  const { googleUser, email } = router.query;
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [openLicensesModal, setOpenLicensesModal] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaError, setCaptchaError] = useState('');
  const [noUpdates, setNoUpdates] = useState(false);

  const { currencies } = useCurrenciesForAmericas();
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');

  const handleCurrencyChange = (value: string | number) => {
    const currencyCode = value as string;
    const currency = currencies.find((c) => c.code === currencyCode);
    setSelectedCurrency(currencyCode);
    setSelectedSymbol(currency?.symbol || '');
    setValue('currency', currencyCode); // Asegúrate de actualizar el formulario
  };

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
          credentials: 'include',
        });
        const { csrfToken } = await res.json();
        setCsrfToken(csrfToken);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    if (!csrfToken) {
      fetchCsrfToken();
    }
  }, [csrfToken]);

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
    setCaptchaError('');

    // Obtén el captchaToken
    const captchaToken = recaptchaRef.current?.getValue();

    if (!csrfToken) {
      setFormError('No se pudo obtener el token CSRF, intenta nuevamente.');
      setLoading(false);
      return;
    }

    if (!captchaToken) {
      setCaptchaError('Por favor, completa el captcha');
      setLoading(false);
      return;
    }

    try {
      const storedPriceId = localStorage.getItem('selectedPriceId');
      const verificationToken = nanoid();

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          priceId: storedPriceId,
          verificationToken,
          currency: selectedCurrency,
          currencySymbol: selectedSymbol,
          captchaToken,
          noUpdates,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || 'Error al registrar el usuario.');
      }

      const emailResponse = await fetch('/api/auth/sendVerificationEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          verificationToken,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Error al enviar el correo de verificación.');
      }

      setModalMessage(
        'Se ha enviado un correo de verificación. Por favor, revisa tu bandeja de entrada y la de correo no deseado.'
      );
      setIsModalOpen(true);

      return;
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al enviar la solicitud.';
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sitekey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

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

        {/* Campos del formulario */}
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

        <label
          htmlFor="currency"
          className="font-semibold text-mediumBlue text-base"
        >
          Moneda en la que va a efectuar las operaciones
        </label>
        <Select
          options={[
            { value: '', label: 'Seleccione una moneda' },
            ...currencies.map((currency) => ({
              value: currency.code,
              label: `${currency.code} - ${currency.name}`,
            })),
          ]}
          value={selectedCurrency}
          onChange={(value) => handleCurrencyChange(value)}
          className="border rounded-md w-full p-2 mb-4"
        />
        {selectedCurrency && (
          <p>
            Moneda seleccionada: {selectedCurrency} ({selectedSymbol})
          </p>
        )}
        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={sitekey || ''}
            ref={recaptchaRef}
            onChange={(token) => {
              if (token) {
                setCaptchaError(''); // Limpia cualquier error previo
              }
            }}
            onErrored={() =>
              setCaptchaError(
                'Error al completar el captcha. Intenta nuevamente.'
              )
            }
            onExpired={() =>
              setCaptchaError(
                'El captcha expiró. Por favor, completa el captcha nuevamente.'
              )
            }
          />
        </div>
        {captchaError && <p className="text-red-500">{captchaError}</p>}

        {/* New checkbox for updates */}
        <div className="flex items-center mt-4 ">
          <input
            type="checkbox"
            id="noUpdates"
            checked={noUpdates}
            onChange={(e) => setNoUpdates(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="noUpdates" className="text-sm text-gray-500">
            No quiero recibir actualizaciones o información sobre
            realtorTrackpro
          </label>
        </div>
        <p className="text-sm text-gray-500 my-2">
          Registrándote, aceptas los{' '}
          <Link
            href="/RealtorTrackproTerminosYPolíticas.pdf"
            className="text-mediumBlue"
          >
            Términos y Condiciones y la Políticas de Privacidad de Realtor
            Trackpro
          </Link>
        </p>
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
        messageClassName="text-base"
        className="w-[50%]"
      />

      <LicensesModal
        isOpen={openLicensesModal}
        onClose={() => setOpenLicensesModal(false)}
      />
    </div>
  );
};

export default RegisterForm;
