import { formatNumber } from "@/utils/formatNumber";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";
import Loader from "../Loader";
import OperationsModal from "./OperationsModal";
import { useOperations } from "../../../hooks/useOperations";
import {
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/stores/authStore";

interface OperationsTableProps {
  filter: "all" | "open" | "closed";
  totals: {
    valor_reserva: number;
    suma_total_de_puntas: number;
    honorarios_broker: number;
    honorarios_asesor: number;
  };
}

const OperationsTable: React.FC<OperationsTableProps> = ({
  filter,
  totals,
}) => {
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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr
            className={`${OPERATIONS_LIST_COLORS.headerBg} hidden md:table-row text-center`}
          >
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Fecha de Operación
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Dirección de Reserva
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Tipo de Operación
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Referido
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Compartido
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Sobre de Reserva
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Sobre de Refuerzo
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Valor Reserva
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Puntas
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Honorarios Totales Brutos
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Honorarios Totales Netos
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
            >
              Estado
            </th>
            <th
              className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} font-semibold`}
              colSpan={2}
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredOperations.map((operacion) => (
            <tr
              key={operacion.id}
              className={`${OPERATIONS_LIST_COLORS.rowBg} ${OPERATIONS_LIST_COLORS.rowHover} border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out text-center`}
            >
              <td className="py-3 px-4 before:content-['Fecha:'] md:before:content-none">
                {new Date(operacion.fecha_operacion).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 before:content-['Dirección:'] md:before:content-none">
                {operacion.direccion_reserva}
              </td>
              <td className="py-3 px-4 before:content-['Tipo:'] md:before:content-none">
                {operacion.tipo_operacion}
              </td>
              <td className="py-3 px-4 before:content-['Referido:'] md:before:content-none">
                {operacion.referido}
              </td>
              <td className="py-3 px-4 before:content-['Compartido:'] md:before:content-none">
                {operacion.compartido}
              </td>
              <td className="py-3 px-4 before:content-['Sobre Reserva:'] md:before:content-none">
                {operacion.numero_sobre_reserva}
              </td>
              <td className="py-3 px-4 before:content-['Sobre Refuerzo:'] md:before:content-none">
                {operacion.numero_sobre_refuerzo}
              </td>
              <td className="py-3 px-4 before:content-['Valor Reserva:'] md:before:content-none">
                ${formatNumber(operacion.valor_reserva)}
              </td>
              <td className="py-3 px-4 before:content-['Puntas:'] md:before:content-none">
                {formatNumber(
                  Number(operacion.punta_vendedora) +
                    Number(operacion.punta_compradora)
                )}
              </td>
              <td className="py-3 px-4 before:content-['Honorarios Agencia:'] md:before:content-none">
                ${formatNumber(operacion.honorarios_broker)}
              </td>
              <td className="py-3 px-4 before:content-['Honorarios Netos:'] md:before:content-none">
                ${formatNumber(operacion.honorarios_asesor)}
              </td>
              <td className="py-3 px-4 md:before:content-none">
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
              </td>
              <td className="md:before:content-none">
                <button
                  onClick={() => handleEditClick(operacion)}
                  className="text-darkBlue hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </td>
              <td className="md:before:content-none">
                <button
                  onClick={() => handleDeleteClick(operacion.id)}
                  className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                >
                  <TrashIcon className="text-redAccent h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
          <tr
            className={`font-bold hidden md:table-row ${OPERATIONS_LIST_COLORS.headerBg}`}
          >
            <td className="py-3 px-4" colSpan={7}>
              Total
            </td>
            <td className="py-3 px-4">
              ${formatNumber(Number(totals.valor_reserva))}
            </td>
            <td className="py-3 px-4">
              ${formatNumber(Number(totals.suma_total_de_puntas))}
            </td>
            <td className="py-3 px-4">
              ${formatNumber(Number(totals.honorarios_broker))}
            </td>
            <td className="py-3 px-4">
              ${formatNumber(Number(totals.honorarios_asesor))}
            </td>
            <td className="py-3 px-4" colSpan={3}></td>
          </tr>
        </tbody>
      </table>
      {isEditModalOpen && (
        <OperationsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          operation={selectedOperation}
          onUpdate={() => fetchItems(userID || "")} // Provide a default empty string if userID is null
        />
      )}
    </div>
  );
};

export default OperationsTable;
