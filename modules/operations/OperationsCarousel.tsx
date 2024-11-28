import Slider from 'react-slick';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { PencilIcon, ServerIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

import OperationsModal from './OperationsModal';

import { formatNumber } from '@/common/utils/formatNumber';
import {
  fetchUserOperations,
  updateOperation,
  deleteOperation,
} from '@/lib/api/operationsApi';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useAuthStore } from '@/stores/authStore';
import { Operation } from '@/common/types/';
import { useUserDataStore } from '@/stores/userDataStore';
import ModalDelete from '@/components/PrivateComponente/CommonComponents/Modal';
import SkeletonLoader from '@/components/PrivateComponente/CommonComponents/SkeletonLoader';
import { OperationStatus, PATHS, QueryKeys } from '@/common/enums';

const OperationsCarousel: React.FC = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  const marginTopStyle =
    currentPath.includes(PATHS.OPERATIONS_LIST) && 'mt-[96px]';

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const { userID } = useAuthStore();
  const queryClient = useQueryClient();
  const { userData } = useUserDataStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: operations = [], isLoading } = useQuery({
    queryKey: [QueryKeys.OPERATIONS, userID],
    queryFn: () => fetchUserOperations(userID!),
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Operation> }) =>
      updateOperation({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, userID],
      });
    },
  });

  const deleteOperationMutation = useMutation({
    mutationFn: (id: string) => deleteOperation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.OPERATIONS, userID],
      });
    },
  });

  const handleDeleteClick = useCallback(
    (id: string) => {
      deleteOperationMutation.mutate(id);
    },
    [deleteOperationMutation]
  );

  const handleDeleteButtonClick = useCallback((operation: Operation) => {
    setSelectedOperation(operation);
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditClick = (operation: Operation) => {
    setIsEditModalOpen(true);
    setSelectedOperation(operation);
  };

  const searchedOperations = searchQuery
    ? operations.filter((operation: Operation) =>
        operation.direccion_reserva
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : [];

  if (isLoading) {
    return <SkeletonLoader height={64} count={11} />;
  }

  const handleEstadoChange = (id: string, currentEstado: string) => {
    const newEstado =
      currentEstado === OperationStatus.EN_CURSO
        ? OperationStatus.CERRADA
        : OperationStatus.EN_CURSO;
    updateEstadoMutation.mutate({ id, data: { estado: newEstado } });
  };

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-md pb-10 ${marginTopStyle}`}
    >
      <div className="flex justify-center  flex-col items-center">
        <p className="text-[20px] xl:text-[20px] 2xl:text-[22px] text-center font-semibold">
          Informe Operaciones
        </p>
        <input
          type="text"
          placeholder="Buscar operación por dirección..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[320px] p-2 my-8 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic text-center"
        />
      </div>
      {searchedOperations.length > 0 ? (
        <Slider {...settings}>
          {searchedOperations.map((operacion: Operation) => (
            <div key={operacion.id} className="px-0 py-4">
              <div className="bg-lightBlue text-white p-4 rounded-xl shadow-md flex justify-center space-x-4 h-[400px] max-h-[400px] md:h-[300px] md:max-h-[300px]">
                <div className="space-y-2 sm:space-y-4 flex flex-col justify-around w-1/2">
                  <p>
                    <strong>Fecha de Operación:</strong>{' '}
                    {new Date(operacion.fecha_operacion).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Operación:</strong> {operacion.direccion_reserva}
                  </p>
                  <p>
                    <strong>Tipo de Operación:</strong>{' '}
                    {operacion.tipo_operacion}
                  </p>
                  <p>
                    <strong>Valor Reserva / Cierre</strong> $
                    {formatNumber(operacion.valor_reserva)}
                  </p>
                  <p>
                    <strong>Puntas Obtenidas:</strong>{' '}
                    {formatNumber(
                      Number(operacion.punta_vendedora) +
                        Number(operacion.punta_compradora)
                    )}
                  </p>
                  <p>
                    <strong>Porcentaje Punta Compradora:</strong>{' '}
                    {formatNumber(
                      Number(operacion.porcentaje_punta_compradora)
                    )}
                    %
                  </p>
                  <p>
                    <strong>Porcentaje Punta Vendedora:</strong>{' '}
                    {formatNumber(Number(operacion.porcentaje_punta_vendedora))}
                    %
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-4 flex flex-col justify-around w-1/2">
                  <p>
                    <strong>Porcentaje Puntas</strong>{' '}
                    {formatNumber(
                      Number(operacion.porcentaje_punta_compradora) +
                        Number(operacion.porcentaje_punta_vendedora)
                    )}
                    %
                  </p>
                  <p>
                    <strong>Honorarios Totales Brutos:</strong> $
                    {formatNumber(operacion.honorarios_broker)}
                  </p>
                  <p>
                    <strong>Honorarios Totales Netos:</strong> $
                    {formatNumber(operacion.honorarios_asesor)}
                  </p>
                  <p>
                    <strong>Datos Compartidos:</strong>{' '}
                    {operacion.compartido === '' ? 'N/A' : operacion.compartido}
                  </p>
                  <p>
                    <strong>Porcentaje de Compartido:</strong>{' '}
                    {formatNumber(Number(operacion.porcentaje_compartido) ?? 0)}
                    %
                  </p>
                  <p>
                    <strong>Datos Referidos:</strong>{' '}
                    {operacion.referido === '' ? 'N/A' : operacion.referido}
                  </p>
                  <p>
                    <strong>Porcentaje Referido:</strong>{' '}
                    {formatNumber(Number(operacion.porcentaje_referido) ?? 0)}%
                  </p>
                  <div className="flex justify-around">
                    <button
                      onClick={() => handleEditClick(operacion)}
                      className="text-lightPink hover:text-lightGreen transition duration-150 ease-in-out text-sm font-semibold"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteButtonClick(operacion)}
                      className="text-redAccent hover:text-red-700 transition duration-150 ease-in-out text-sm font-semibold"
                    >
                      <TrashIcon className="text-redAccent h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        handleEstadoChange(operacion.id, operacion.estado)
                      }
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition duration-150 ease-in-out ${
                        operacion.estado === OperationStatus.EN_CURSO
                          ? `bg-mediumBlue`
                          : `bg-darkBlue`
                      }`}
                    >
                      <span
                        className={`${
                          operacion.estado === OperationStatus.EN_CURSO
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        } inline-block w-4 h-4 transform bg-white rounded-full transition duration-150 ease-in-out`}
                      >
                        {operacion.estado === OperationStatus.EN_CURSO ? (
                          <p className="h-4 w-4 text-mediumBlue flex justify-center items-center">
                            A
                          </p>
                        ) : (
                          <p className="h-4 w-4 text-darkBlue flex justify-center items-center">
                            C
                          </p>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <ServerIcon className="h-12 w-12 " strokeWidth={1} />
          <p className="text-center font-semibold">No hay operaciones</p>
        </div>
      )}
      {isEditModalOpen && (
        <OperationsModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          operation={selectedOperation}
          onUpdate={() => fetchUserOperations(userID!)} // This ensures the operations are refetched after update
          currentUser={userData!}
        />
      )}
      <ModalDelete
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        message="¿Estás seguro de querer eliminar esta operación?"
        onSecondButtonClick={() => {
          if (selectedOperation?.id) {
            handleDeleteClick(selectedOperation.id);
            setIsDeleteModalOpen(false);
          }
        }}
        secondButtonText="Borrar Operación"
        className="w-[450px]"
      />
    </div>
  );
};

export default OperationsCarousel;
