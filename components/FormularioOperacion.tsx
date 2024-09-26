// components/FormularioOperacion.tsx
import { useState, useEffect, useCallback } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ModalOK from "./ModalOK";
import { useRouter } from "next/router"; // Import useRouter

const FormularioOperacion = () => {
  const [formData, setFormData] = useState({
    fecha_operacion: "",
    direccion_reserva: "",
    tipo_operacion: "",
    punta_compradora: 0,
    punta_vendedora: 0,
    valor_reserva: "",
    numero_sobre_reserva: "",
    numero_sobre_refuerzo: "",
    porcentaje_honorarios_asesor: "",
    porcentaje_honorarios_broker: "",
    porcentaje_punta_vendedora: "",
    porcentaje_punta_compradora: "",
    referido: "",
    compartido: "",
    estado: "En Curso",
  });

  const [userUID, setUserUID] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [honorariosBroker, setHonorariosBroker] = useState(0);
  const [honorariosAsesor, setHonorariosAsesor] = useState(0);

  const router = useRouter(); // Initialize useRouter

  // Obtener el UID del usuario autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUID(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const valor_reserva = parseFloat(formData.valor_reserva) || 0;
    const porcentaje_honorarios_asesor =
      parseFloat(formData.porcentaje_honorarios_asesor) || 0;
    const porcentaje_honorarios_broker =
      parseFloat(formData.porcentaje_honorarios_broker) || 0;

    const calculatedHonorariosBroker =
      (valor_reserva * porcentaje_honorarios_broker) / 100;

    const calculatedHonorariosAsesor =
      (valor_reserva *
        (porcentaje_honorarios_broker / 100) *
        porcentaje_honorarios_asesor) /
      100;

    setHonorariosBroker(calculatedHonorariosBroker);
    setHonorariosAsesor(calculatedHonorariosAsesor);
  }, [
    formData.valor_reserva,
    formData.porcentaje_honorarios_asesor,
    formData.porcentaje_punta_compradora,
    formData.porcentaje_punta_vendedora,
    formData.porcentaje_honorarios_broker,
  ]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]:
          type === "checkbox"
            ? (e.target as HTMLInputElement).checked
              ? 1
              : 0
            : value,
      }));
    },
    []
  );

  console.log(formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userUID) {
      setModalMessage("Usuario no autenticado. Por favor, inicia sesión.");
      setShowModal(true);
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
        porcentaje_honorarios_broker:
          parseFloat(formData.porcentaje_honorarios_broker) || 0,
        honorarios_broker: honorariosBroker,
        honorarios_asesor: honorariosAsesor,
        user_uid: userUID,
        estado: formData.estado, // Ensure estado is included in the data to submit
        punta_compradora: formData.punta_compradora, // No need to check again, already handled in handleChange
        punta_vendedora: formData.punta_vendedora, // No need to check again, already handled in handleChange
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
        setModalMessage(errorData.message || "Error al guardar la operación");
        setShowModal(true);
        return;
      }

      setModalMessage("Operación guardada exitosamente");
      setShowModal(true);
      setFormData({
        fecha_operacion: "",
        direccion_reserva: "",
        tipo_operacion: "",
        punta_compradora: 0, // Reset to 0
        punta_vendedora: 0, // Reset to 0
        valor_reserva: "",
        numero_sobre_reserva: "",
        numero_sobre_refuerzo: "",
        porcentaje_honorarios_asesor: "",
        porcentaje_honorarios_broker: "",
        porcentaje_punta_vendedora: "",
        porcentaje_punta_compradora: "",
        referido: "",
        compartido: "",
        estado: "En Curso", // Reset estado to "En Curso"
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al guardar la operación:", error);
      setModalMessage("Error al guardar la operación");
      setShowModal(true);
    }
  };

  const handleModalAccept = () => {
    router.push("/dashboard"); // Redirect to dashboard
  };

  return (
    <div className="flex justify-center items-center w-full">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded shadow-md w-[70%]"
      >
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
              <option value="Desarrollo">Desarrollo Inmobiliario</option>
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
            <div className="flex items-center justify-between">
              <input
                placeholder="Porcentaje Punta Compradora"
                type="text"
                name="porcentaje_punta_compradora"
                onChange={handleChange}
                className="w-[45%] p-2 mb-4 border border-gray-300 rounded"
                required
              />

              <input
                placeholder="Porcentaje Punta Vendedora"
                type="text"
                name="porcentaje_punta_vendedora"
                onChange={handleChange}
                className="w-[45%] p-2 mb-4 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <input
                type="text"
                name="porcentaje_honorarios_asesor"
                placeholder="Porcentaje Honorarios Asesor"
                value={formData.porcentaje_honorarios_asesor}
                onChange={handleChange}
                className="w-[45%]  p-2 mb-4 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="porcentaje_honorarios_broker"
                placeholder="Porcentaje Honorarios Broker"
                value={formData.porcentaje_honorarios_broker}
                onChange={handleChange}
                className="w-[45%] p-2 mb-4 border border-gray-300 rounded"
                required
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 px-2">
            {/* Right column */}
            <input
              type="text"
              name="numero_sobre_reserva"
              placeholder="Sobre de Reserva (opcional)"
              value={formData.numero_sobre_reserva}
              onChange={handleChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="numero_sobre_refuerzo"
              placeholder="Sobre de Refuerzo (opcional)"
              value={formData.numero_sobre_refuerzo}
              onChange={handleChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />

            <input
              type="text"
              name="referido"
              placeholder="Datos Referido"
              value={formData.referido}
              onChange={handleChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="compartido"
              placeholder="Datos Compartido"
              value={formData.compartido}
              onChange={handleChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            <div className="flex justify-center items-center gap-10">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="punta_vendedora"
                  checked={formData.punta_vendedora === 1}
                  onChange={handleChange}
                />
                <label>Punta Vendedora</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="punta_compradora"
                  checked={formData.punta_compradora === 1}
                  onChange={handleChange}
                />
                <label>Punta Compradora</label>
              </div>
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

      <ModalOK
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
        onAccept={handleModalAccept} // Pass the handleModalAccept function
      />
    </div>
  );
};

export default FormularioOperacion;
