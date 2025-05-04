import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/PrivateComponente/FormComponents/Button';

const Gracias = () => {
  const router = useRouter();

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
      <div className="bg-white p-8 shadow-md w-11/12 max-w-lg rounded-lg text-center">
        <h2 className="text-3xl mb-6 font-semibold text-mediumBlue">
          ¡Gracias por registrarte!
        </h2>
        <p className="text-lg mb-8">
          Se ha enviado un correo de verificación. Por favor, revisa tu bandeja
          de entrada y la de correo no deseado.
        </p>
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={() =>
              (window.location.href = 'https://realtortrackpro.com')
            }
            className="bg-mediumBlue hover:bg-lightBlue text-white py-2 px-6 rounded-md w-48"
          >
            Volver al sitio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Gracias;
