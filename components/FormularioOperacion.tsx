// components/FormularioOperacion.tsx
import { useState, useEffect, useCallback } from "react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const FormularioOperacion = () => {
  const [formData, setFormData] = useState({
    fecha_operacion: "",
    direccion_reserva: "",
    tipo_operacion: "",
    valor_reserva: "",
    numero_sobre_reserva: "",
    numero_sobre_refuerzo: "",
    porcentaje_honorarios_asesor: "",
    honorarios_brutos: "",
    referido: "",
    compartido: "",
  });

  const [userUID, setUserUID] = useState<string | null>(null);
  const [valorNeto, setValorNeto] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUID(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const valor_reserva = parseFloat(formData.valor_reserva) || 0;
    const honorarios_brutos = parseFloat(formData.honorarios_brutos) || 0;
    const porcentaje_honorarios_asesor = parseFloat(formData.porcentaje_honorarios_asesor) || 0;

    const calculatedValorNeto =
      valor_reserva *
      (honorarios_brutos / 100) *
      (porcentaje_honorarios_asesor / 100);
    setValorNeto(calculatedValorNeto);
  }, [formData.valor_reserva, formData.honorarios_brutos, formData.porcentaje_honorarios_asesor]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userUID) {
      alert("Usuario no autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        fecha_operacion: new Date(formData.fecha_operacion),
        valor_reserva: parseFloat(formData.valor_reserva) || 0,
        numero_sobre_reserva: parseFloat(formData.numero_sobre_reserva) || 0,
        numero_sobre_refuerzo: parseFloat(formData.numero_sobre_refuerzo) || 0,
        porcentaje_honorarios_asesor: parseFloat(formData.porcentaje_honorarios_asesor) || 0,
        honorarios_brutos: parseFloat(formData.honorarios_brutos) || 0,
        valor_neto: valorNeto,
        user_uid: userUID,
      };

      await addDoc(collection(db, "reservas"), dataToSubmit);
      alert("Operación guardada exitosamente");
      setFormData({
        fecha_operacion: "",
        direccion_reserva: "",
        tipo_operacion: "",
        valor_reserva: "",
        numero_sobre_reserva: "",
        numero_sobre_refuerzo: "",
        porcentaje_honorarios_asesor: "",
        honorarios_brutos: "",
        referido: "",
        compartido: "",
      });
    } catch (error) {
      console.error("Error al guardar la operación:", error);
      alert("Error al guardar la operación");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl mb-4">Agregar Operación</h2>
      <input
        type="date"
        name="fecha_operacion"
        value={formData.fecha_operacion}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        required
      />
      <input
        type="text"
        name="direccion_reserva"
        placeholder="Dirección de la Reserva"
        value={formData.direccion_reserva}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        required
      />
      <select
        name="tipo_operacion"
        value={formData.tipo_operacion}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        required
      >
        <option value="">Selecciona el Tipo de Operación</option>
        <option value="Venta">Venta</option>
        <option value="Alquiler temporal">Alquiler temporal</option>
        <option value="Alquiler">Alquiler</option>
        <option value="Alquiler Comercial">Alquiler Comercial</option>
        <option value="Fondo de Comercio">Fondo de Comercio</option>
        <option value="Desarrollo">Desarrollo</option>
      </select>
      <input
        type="number"
        name="valor_reserva"
        placeholder="Valor de Reserva"
        value={formData.valor_reserva}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        required
      />
      <input
        type="number"
        name="numero_sobre_reserva"
        placeholder="Sobre de Reserva (opcional)"
        value={formData.numero_sobre_reserva}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      />
      <input
        type="number"
        name="numero_sobre_refuerzo"
        placeholder="Sobre de Refuerzo (opcional)"
        value={formData.numero_sobre_refuerzo}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      />
      <input
        type="number"
        name="porcentaje_honorarios_asesor"
        placeholder="Porcentaje de Honorarios (e.g., 10%)"
        value={formData.porcentaje_honorarios_asesor}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        required
      />
      <input
        type="number"
        name="honorarios_brutos"
        placeholder="Honorarios Brutos"
        value={formData.honorarios_brutos}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        required
      />
      <input
        type="text"
        name="referido"
        placeholder="Referido"
        value={formData.referido}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        required
      />
      <input
        type="text"
        name="compartido"
        placeholder="Compartido"
        value={formData.compartido}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        required
      />
      <p className="w-full p-2 mb-4 border-gray-300 rounded">
        Valor Neto: {valorNeto.toFixed(2)}
      </p>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Guardar Operación
      </button>
    </form>
  );
};

export default FormularioOperacion;
