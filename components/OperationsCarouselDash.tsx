import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { formatNumber } from "@/utils/formatNumber";
import { useOperationsStore } from "@/stores/useOperationsStore";
import Loader from "./Loader";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const OperationsCarouselDash: React.FC = () => {
  const { operations, setOperations, calculateTotals, isLoading } =
    useOperationsStore();
  const [userUID, setUserUID] = useState<string | null>(null);
  const router = useRouter();

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
        const response = await axios.get(`/api/operationsPerUser`, {
          params: { user_uid: userUID },
        });

        if (response.status !== 200) {
          throw new Error("Error al obtener las operaciones del usuario");
        }

        const data = response.data;
        setOperations(data);
        calculateTotals();
      } catch (error) {
        console.error("Error al obtener las operaciones:", error);
      }
    };

    fetchOperations();
  }, [userUID, setOperations, calculateTotals]);

  if (isLoading) {
    return <Loader />;
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="bg-white p-6 mt-6 rounded-lg shadow-md pb-10">
      <h2 className="text-2xl font-bold mb-2 text-center">
        Lista de Operaciones
      </h2>
      {operations.length === 0 ? (
        <p className="text-center text-gray-600">No existen operaciones</p>
      ) : (
        <Slider {...settings}>
          {operations.map((operacion) => (
            <div key={operacion.id} className="p-4">
              <div className="bg-[#5DADE2]/10 text-[#2E86C1] p-4 rounded-lg shadow-md flex justify-center space-x-4">
                <div className="space-y-2 sm:space-y-4">
                  <p>
                    <strong>Fecha de Operación:</strong>{" "}
                    {new Date(operacion.fecha_operacion).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Dirección de Reserva:</strong>{" "}
                    {operacion.direccion_reserva}
                  </p>
                  <p>
                    <strong>Tipo de Operación:</strong>{" "}
                    {operacion.tipo_operacion}
                  </p>
                  <p>
                    <strong>Valor Reserva:</strong> $
                    {formatNumber(operacion.valor_reserva)}
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-4">
                  <p>
                    <strong>Puntas:</strong>{" "}
                    {formatNumber(
                      operacion.punta_vendedora + operacion.punta_compradora
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
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default OperationsCarouselDash;
