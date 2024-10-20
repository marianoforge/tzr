import React, { useState, useEffect } from "react";
import { TeamMember } from "@/types";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember;
  onSubmit: (member: TeamMember) => void;
};

const Modal = ({ isOpen, onClose, member, onSubmit }: ModalProps) => {
  // Estados locales para controlar los inputs
  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [email, setEmail] = useState(member.email);

  // Actualizar los valores si el modal se abre con un nuevo miembro
  useEffect(() => {
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setEmail(member.email);
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Crear un objeto actualizado con los valores del modal
    const updatedMember = {
      ...member,
      firstName,
      lastName,
      email,
    };
    onSubmit(updatedMember); // Llamar a la función de submit que se pasó desde el componente padre
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg min-w-[360px] sm:min-w-[600px]">
        <h2 className="text-xl font-bold mb-4">Editar Miembro</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre:</label>
            <input
              className="border p-2 w-full mb-4"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label>Apellido:</label>
            <input
              className="border p-2 w-full mb-4"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              className="border p-2 w-full mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-lg"
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            className="bg-red-500 text-white p-2 rounded-lg ml-2"
            onClick={onClose}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
