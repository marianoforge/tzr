import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import OperationsContainer from "./OperationsContainer";
import OperationsModal from "./OperationsModal";
import { formatNumber } from "@/utils/formatNumber";
import { Operation } from "@/types";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { OPERATIONS_LIST_COLORS } from "@/lib/constants";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  fetchUserOperations,
  updateOperation,
  deleteOperation,
} from "@/lib/api/operationsApi";

interface OperationsCarouselDashProps {
  filter: "all" | "open" | "closed";
  setFilter: React.Dispatch<React.SetStateAction<"all" | "open" | "closed">>;
}

const OperationsList: React.FC<OperationsCarouselDashProps> = ({
  filter,
  setFilter,
}) => {
  const [userUID, setUserUID] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Autenticación del usuario para obtener UID
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

  // Query para obtener las operaciones del usuario
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ["operations", userUID],
    queryFn: () => fetchUserOperations(userUID || ""),
    enabled: !!userUID, // Solo se ejecuta si userUID está disponible
  });

  // Filtrado de operaciones basado en el filtro seleccionado
  const filteredOperations = operations.filter((operation: Operation) => {
    if (filter === "all") return true;
    return filter === "open"
      ? operation.estado === "En Curso"
      : operation.estado === "Cerrada";
  });

  // Función para calcular los totales filtrados
  const calculateFilteredTotals = () => {
    return filteredOperations.reduce(
      (
        totals: {
          valor_reserva: number;
          suma_total_de_puntas: number;
          honorarios_broker: number;
          honorarios_asesor: number;
        },
        operation: Operation
      ) => {
        totals.valor_reserva += Number(operation.valor_reserva || 0);
        totals.suma_total_de_puntas +=
          Number(operation.punta_vendedora || 0) +
          Number(operation.punta_compradora || 0);
        totals.honorarios_broker += Number(operation.honorarios_broker || 0);
        totals.honorarios_asesor += Number(operation.honorarios_asesor || 0);
        return totals;
      },
      {
        valor_reserva: 0,
        suma_total_de_puntas: 0,
        honorarios_broker: 0,
        honorarios_asesor: 0,
      }
    );
  };

  const filteredTotals = calculateFilteredTotals();

  // Mutación para actualizar el estado de una operación
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Operation> }) =>
      updateOperation({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["operations", userUID],
      });
    },
  });

  const handleEstadoChange = (id: string, currentEstado: string) => {
    const newEstado = currentEstado === "En Curso" ? "Cerrada" : "En Curso";
    updateMutation.mutate({ id, data: { estado: newEstado } });
  };

  // Mutación para eliminar una operación
  const deleteMutation = useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["operations", userUID],
      });
    },
  });

  const handleDeleteClick = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEditClick = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsEditModalOpen(true);
  };

  return (
    <OperationsContainer
      isLoading={isLoading}
      title="Lista de Operaciones"
      operationsLength={filteredOperations.length}
    >
      <div className="flex justify-center mb-6 mt-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 mx-2 ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Todas las Operaciones
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`px-4 py-2 mx-2 ${
            filter === "open" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Operaciones Abiertas
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-4 py-2 mx-2 ${
            filter === "closed" ? "bg-blue-500 text-white" : "bg-gray-200"
          } rounded`}
        >
          Operaciones Cerradas
        </button>
      </div>
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
            {filteredOperations.map((operacion: Operation) => (
              <tr
                key={operacion.id}
                className={`${OPERATIONS_LIST_COLORS.rowBg} ${OPERATIONS_LIST_COLORS.rowHover} border-b md:table-row flex flex-col md:flex-row mb-4 transition duration-150 ease-in-out text-center`}
              >
                <td className="py-3 px-4">
                  {new Date(operacion.fecha_operacion).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">{operacion.direccion_reserva}</td>
                <td className="py-3 px-4">{operacion.tipo_operacion}</td>
                <td className="py-3 px-4">{operacion.referido}</td>
                <td className="py-3 px-4">{operacion.compartido}</td>
                <td className="py-3 px-4">{operacion.numero_sobre_reserva}</td>
                <td className="py-3 px-4">{operacion.numero_sobre_refuerzo}</td>
                <td className="py-3 px-4">
                  ${formatNumber(operacion.valor_reserva)}
                </td>
                <td className="py-3 px-4">
                  {formatNumber(
                    Number(operacion.punta_vendedora) +
                      Number(operacion.punta_compradora)
                  )}
                </td>
                <td className="py-3 px-4">
                  ${formatNumber(operacion.honorarios_broker)}
                </td>
                <td className="py-3 px-4">
                  ${formatNumber(operacion.honorarios_asesor)}
                </td>
                <td className="py-3 px-4">
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
                <td>
                  <button
                    onClick={() => handleEditClick(operacion)}
                    className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out text-sm font-semibold"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteClick(operacion.id)}
                    className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {/* Fila de totales */}
            <tr
              className={`font-bold hidden md:table-row ${OPERATIONS_LIST_COLORS.headerBg}`}
            >
              <td className="py-3 px-4" colSpan={7}>
                Total
              </td>
              <td
                className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
              >
                ${formatNumber(Number(filteredTotals.valor_reserva))}
              </td>
              <td
                className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
              >
                {formatNumber(Number(filteredTotals.suma_total_de_puntas))}
              </td>
              <td
                className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
              >
                ${formatNumber(Number(filteredTotals.honorarios_broker))}
              </td>
              <td
                className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText} text-center`}
              >
                ${formatNumber(Number(filteredTotals.honorarios_asesor))}
              </td>
              <td
                className={`py-3 px-4 ${OPERATIONS_LIST_COLORS.headerText}`}
                colSpan={3}
              ></td>
            </tr>
          </tbody>
        </table>
      </div>
      {isEditModalOpen && (
        <OperationsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          operation={selectedOperation}
          onUpdate={() =>
            queryClient.invalidateQueries({
              queryKey: ["operations", userUID],
            })
          }
        />
      )}
    </OperationsContainer>
  );
};

export default OperationsList;
