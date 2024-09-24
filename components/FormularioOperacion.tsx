// components/FormularioOperacion.tsx
import { useState, useEffect, useCallback } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const FormularioOperacion = () => {
  const [formData, setFormData] = useState({
    fecha_operacion: "",
    direccion_reserva: "",
    tipo_operacion: "",
    punta_compradora: false,
    punta_vendedora: false,
    valor_reserva: "",
    numero_sobre_reserva: "",
    numero_sobre_refuerzo: "",
    porcentaje_honorarios_asesor: "", // Este campo se llenará automáticamente con la comisión del usuario
    honorarios_brutos: "",
    referido: "",
    compartido: "",
    estado: "En Curso", // Initialize estado as "En Curso"
  });

  const [userUID, setUserUID] = useState<string | null>(null);
  const [valorNeto, setValorNeto] = useState(0);
  const [comision, setComision] = useState(0);

  // Obtener el UID del usuario autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUID(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserCommission = async () => {
      if (!userUID) return;

      try {
        const response = await fetch(
          `/api/getUserCommission?user_uid=${userUID}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener la comisión del usuario");
        }

        const data = await response.json();
        setComision(data.comision);
        setFormData((prevData) => ({
          ...prevData,
          porcentaje_honorarios_asesor: data.comision.toString(), // Asignar la comisión al campo correspondiente
        }));
      } catch (error) {
        console.error("Error al obtener la comisión:", error);
      }
    };

    fetchUserCommission();
  }, [userUID]);

  useEffect(() => {
    const valor_reserva = parseFloat(formData.valor_reserva) || 0;
    const honorarios_brutos = parseFloat(formData.honorarios_brutos) || 0;
    const porcentaje_honorarios_asesor =
      parseFloat(formData.porcentaje_honorarios_asesor) || 0;

    const calculatedValorNeto =
      valor_reserva *
      (honorarios_brutos / 100) *
      (porcentaje_honorarios_asesor / 100);
    setValorNeto(calculatedValorNeto);
  }, [
    formData.valor_reserva,
    formData.honorarios_brutos,
    formData.porcentaje_honorarios_asesor,
  ]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userUID) {
      alert("Usuario no autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        fecha_operacion: new Date(formData.fecha_operacion).toISOString(),
        valor_reserva: parseFloat(formData.valor_reserva) || 0,
        numero_sobre_reserva: parseFloat(formData.numero_sobre_reserva) || 0,
        numero_sobre_refuerzo: parseFloat(formData.numero_sobre_refuerzo) || 0,
        porcentaje_honorarios_asesor:
          parseFloat(formData.porcentaje_honorarios_asesor) || 0,
        honorarios_brutos: parseFloat(formData.honorarios_brutos) || 0,
        valor_neto: valorNeto,
        user_uid: userUID,
        estado: formData.estado, // Ensure estado is included in the data to submit
      };

      // Enviar los datos al endpoint de la API
      const response = await fetch("/api/operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Error al guardar la operación");
        return;
      }

      alert("Operación guardada exitosamente");
      setFormData({
        fecha_operacion: "",
        direccion_reserva: "",
        tipo_operacion: "",
        punta_compradora: false,
        punta_vendedora: false,
        valor_reserva: "",
        numero_sobre_reserva: "",
        numero_sobre_refuerzo: "",
        porcentaje_honorarios_asesor: "",
        honorarios_brutos: "",
        referido: "",
        compartido: "",
        estado: "En Curso", // Reset estado to "En Curso"
      });
    } catch (error) {
      console.error("Error al guardar la operación:", error);
      alert("Error al guardar la operación");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl mb-4">Agregar Operación</h2>
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2">
          {/* Left column */}
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
          <div className="flex items-center mb-4">
            <label className="mr-4">
              <input
                type="checkbox"
                name="punta_compradora"
                checked={formData.punta_compradora}
                onChange={handleChange}
                className="mr-2"
              />
              Punta Compradora / Inquilina
            </label>
            <label>
              <input
                type="checkbox"
                name="punta_vendedora"
                checked={formData.punta_vendedora}
                onChange={handleChange}
                className="mr-2"
              />
              Punta Vendedora / Propietario
            </label>
          </div>
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
        </div>
        <div className="w-full md:w-1/2 px-2">
          {/* Right column */}
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
          <div className="w-full p-2 mb-4">
            <p className="p-2 mb-2 border-gray-300 rounded">
              Porcentaje de Honorarios (Comisión): {comision}%
            </p>
            <p className="p-2 mb-2 border-gray-300 rounded">
              Valor Neto: {valorNeto.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className=" bg-[#7ED994] text-white p-2 rounded hover:bg-[#7ED994]/80 transition-all duration-300 font-bold"
        >
          Guardar Operación
        </button>
      </div>
    </form>
  );
};

export default FormularioOperacion;
