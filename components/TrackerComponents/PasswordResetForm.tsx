import { useState } from "react";
import { resetPassword } from "@/lib/api/auth";
import Button from "@/components/TrackerComponents/FormComponents/Button";
import Input from "@/components/TrackerComponents/FormComponents/Input";

const PasswordResetForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await resetPassword(email);
      setMessage(response.message);
    } catch (error) {
      console.error(error);
      setError("Error al enviar el correo de restablecimiento de contraseña.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handlePasswordReset}
        className="bg-white p-6 rounded shadow-md w-11/12 max-w-lg"
      >
        <h2 className="text-2xl mb-4 text-center">
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
          className="bg-mediumBlue hover:bg-blue-600 text-white py-2 px-4 rounded-md w-full mt-4"
        >
          Enviar enlace de recuperación
        </Button>
      </form>
    </div>
  );
};

export default PasswordResetForm;