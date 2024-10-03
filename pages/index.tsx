// pages/index.tsx
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login"); // Redirige a la página de inicio de sesión
  };

  const handleRegisterRedirect = () => {
    router.push("/register"); // Redirige a la página de registro
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white rounded shadow-md w-11/12 max-w-lg">
          <h1 className="text-4xl font-bold mb-4">Bienvenido a TrackPro</h1>
          <p className="mb-6">
            Administra y gestiona todas tus operaciones inmobiliarias de manera
            sencilla y eficiente.
          </p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleLoginRedirect}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 "
            >
              Iniciar Sesión
            </button>
            <button
              onClick={handleRegisterRedirect}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Registrarse
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
