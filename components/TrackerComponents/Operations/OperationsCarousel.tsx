import Slider from "react-slick";
import { formatNumber } from "@/utils/formatNumber";
import Loader from "../Loader";
import OperationsModal from "./OperationsModal";
import { useOperations } from "../../../hooks/useOperations";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/stores/authStore";

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
  const {
    operations,
    isLoading,
    handleEstadoChange,
    handleEditClick,
    handleDeleteClick,
    isEditModalOpen,
    selectedOperation,
    setIsEditModalOpen,
    fetchItems,
  } = useOperations();

  const { userID } = useAuthStore();

  const filteredOperations = operations.filter((operation) => {
    if (filter === "all") return true;
    return filter === "open"
      ? operation.estado === "En Curso"
      : operation.estado === "Cerrada";
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Slider {...settings}>
        {filteredOperations.map((operacion) => (
          <div key={operacion.id} className="p-4">
            <div className="bg-[#5DADE2]/10 text-darkBlue p-4 rounded-xl shadow-md flex justify-center space-x-4 h-[400px] max-h-[400px] md:h-[300px] md:max-h-[300px]">
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
                    onClick={() => handleEditClick(operacion)}
                    className="text-darkBlue hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(operacion.id)}
                    className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                  >
                    <TrashIcon className="text-redAccent h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      handleEstadoChange(operacion.id, operacion.estado)
                    }
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition duration-150 ease-in-out ${
                      operacion.estado === "En Curso"
                        ? `bg-greenAccent`
                        : `bg-redAccent`
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
          operation={selectedOperation}
          onUpdate={() => fetchItems(userID!)} // fetchItems se invoca correctamente aquí
        />
      )}
    </>
  );
};

export default OperationsCarousel;
