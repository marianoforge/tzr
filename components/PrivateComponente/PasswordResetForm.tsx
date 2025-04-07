import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { resetPassword } from '@/lib/api/auth';

import Button from '../PrivateComponente/FormComponents/Button';
import Input from '../PrivateComponente/FormComponents/Input';

const PasswordResetForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await resetPassword(email);
      setMessage(response.message);
    } catch (error) {
      console.error(error);
      setError('Error al enviar el correo de restablecimiento de contraseña.');
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen rounded-xl ring-1 ring-black/5 bg-gradient-to-r from-lightBlue via-mediumBlue to-darkBlue">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex items-center justify-center lg:justify-start mb-4">
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
          onSubmit={handlePasswordReset}
          className="bg-white p-6 rounded shadow-md w-11/12 max-w-lg"
        >
          <h2 className="text-xl mb-4 text-center">
            Recuperación de Contraseña
          </h2>
          {message && <p className="text-green-500 mb-4">{message}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="bg-mediumBlue hover:bg-blue-600 text-white py-2 px-4 rounded-md w-full"
          >
            Enviar enlace de recuperación
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetForm;
