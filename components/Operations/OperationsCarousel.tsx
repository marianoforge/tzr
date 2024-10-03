import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { formatNumber } from "@/utils/formatNumber";
import { Operation } from "@/types";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useOperationsStore } from "@/stores/useOperationsStore";
import { useRouter } from "next/router";
import Loader from "../Loader";
import OperationsModal from "./OperationsModal";
import {
  CheckIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface OperationsCarouselProps {
  filter: "all" | "open" | "closed";
}

const OperationsCarousel: React.FC<OperationsCarouselProps> = ({ filter }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const { operations, setItems, calculateTotals, isLoading } =
    useOperationsStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEstadoChange = async (id: string, currentEstado: string) => {
    const newEstado = currentEstado === "En Curso" ? "Cerrada" : "En Curso";
    try {
      const response = await axios.put(`/api/operations/${id}`, {
        estado: newEstado,
      });

      if (response.status !== 200) {
        throw new Error("Error updating operation status");
      }

      setItems(
        operations.map((operacion) =>
          operacion.id === id ? { ...operacion, estado: newEstado } : operacion
        )
      );
      calculateTotals();
    } catch (error) {
      console.error("Error updating operation status:", error);
    }
  };

  const handleEditClick = async (operation: Operation, id: string) => {
    setSelectedOperation(operation);
    setIsEditModalOpen(true);

    try {
      const response = await fetch(`/api/operations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(operation),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating operation:", error);
    }
  };

  const handleDeleteClick = async (id: string) => {
    try {
      const response = await axios.delete(`/api/operations/${id}`);
      if (response.status !== 200) {
        throw new Error("Error deleting operation");
      }
      setItems(operations.filter((operacion) => operacion.id !== id));
      calculateTotals();
    } catch (error) {
      console.error("Error deleting operation:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchOperations = async () => {
      if (!userUID) return;

      try {
        const response = await axios.get(`/api/operations/user/${userUID}`);

        if (response.status !== 200) {
          throw new Error("Error al obtener las operaciones del usuario");
        }

        const data = response.data;
        setItems(data);
        calculateTotals();
      } catch (error) {
        console.error("Error al obtener las operaciones:", error);
      }
    };

    fetchOperations();
  }, [userUID, setItems, calculateTotals]);

  const filteredOperations = operations.filter((operation) => {
    if (filter === "all") return true;
    if (filter === "open") return operation.estado === "En Curso";
    if (filter === "closed") return operation.estado === "Cerrada";
    return true;
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Slider {...settings}>
        {filteredOperations.map((operacion) => (
          <div key={operacion.id} className="p-4">
            <div className="bg-[#5DADE2]/10 text-[#2E86C1] p-4 rounded-xl shadow-md flex justify-center space-x-4 h-[400px] max-h-[400px] md:h-[300px] md:max-h-[300px]">
              <div className="space-y-2 sm:space-y-4 flex flex-col justify-around">
                <p>
                  <strong>Fecha de Operación:</strong>{" "}
                  {new Date(operacion.fecha_operacion).toLocaleDateString()}
                </p>
                <p>
                  <strong>Dirección de Reserva:</strong>{" "}
                  {operacion.direccion_reserva}
                </p>
                <p>
                  <strong>Tipo de Operación:</strong> {operacion.tipo_operacion}
                </p>
                <p>
                  <strong>Valor Reserva:</strong> $
                  {formatNumber(operacion.valor_reserva)}
                </p>
              </div>
              <div className="space-y-2 sm:space-y-4 flex flex-col justify-around">
                <p>
                  <strong>Puntas:</strong>{" "}
                  {formatNumber(
                    Number(operacion.punta_vendedora) +
                      Number(operacion.punta_compradora)
                  )}
                </p>
                <p>
                  <strong>Honorarios Totales Brutos:</strong> $
                  {formatNumber(operacion.honorarios_broker)}
                </p>
                <p>
                  <strong>Honorarios Totales Netos:</strong> $
                  {formatNumber(operacion.honorarios_asesor)}
                </p>
                <div className="flex justify-around">
                  <button
                    onClick={() => handleEditClick(operacion, operacion.id)}
                    className="text-darkBlue hover:text-blue-700 transition duration-150 ease-in-out text-sm  font-semibold "
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(operacion.id)}
                    className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm  font-semibold"
                  >
                    <TrashIcon className="text-redAccent h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      handleEstadoChange(operacion.id, operacion.estado)
                    }
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition duration-150 ease-in-out ${
                      operacion.estado === "En Curso"
                        ? `greenAccent`
                        : `redAccent`
                    }`}
                  >
                    <span
                      className={`${
                        operacion.estado === "En Curso"
                          ? "translate-x-6"
                          : "translate-x-1"
                      } inline-block w-4 h-4 transform bg-white rounded-full transition duration-150 ease-in-out`}
                    >
                      {operacion.estado === "En Curso" ? (
                        <CheckIcon className="h-4 w-4 text-greenAccent" />
                      ) : (
                        <XMarkIcon className="h-4 w-4 text-redAccent" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      {isEditModalOpen && (
        <OperationsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          operation={selectedOperation} // Ensure operation is either the expected object or null
        />
      )}
    </>
  );
};

export default OperationsCarousel;
