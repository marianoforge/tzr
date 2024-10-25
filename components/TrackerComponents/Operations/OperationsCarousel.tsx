import Slider from 'react-slick';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

import { formatNumber } from '@/utils/formatNumber';
import {
  fetchUserOperations,
  updateOperation,
  deleteOperation,
} from '@/lib/api/operationsApi'; // Ensure you have these functions in your API

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { useAuthStore } from '@/stores/authStore';
import { Operation } from '@/types';
import { useUserDataStore } from '@/stores/userDataStore';

import Loader from '../Loader';

import OperationsModal from './OperationsModal';

const OperationsCarousel: React.FC = () => {
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

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['operations', userID],
    queryFn: () => fetchUserOperations(userID!),
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Operation> }) =>
      updateOperation({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['operations', userID],
      });
    },
  });

  const deleteOperationMutation = useMutation({
    mutationFn: (id: string) => deleteOperation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['operations', userID],
      });
    },
  });

  const searchedOperations = searchQuery
    ? operations.filter((operation: Operation) =>
        operation.direccion_reserva
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : [];

  if (isLoading) {
    return <Loader />;
  }

  const handleEstadoChange = (id: string, currentEstado: string) => {
    const newEstado = currentEstado === 'En Curso' ? 'Cerrada' : 'En Curso';
    updateEstadoMutation.mutate({ id, data: { estado: newEstado } });
  };

  const handleDeleteClick = (id: string) => {
    deleteOperationMutation.mutate(id);
  };

  const handleEditClick = (operation: Operation) => {
    setIsEditModalOpen(true);
    setSelectedOperation(operation);
  };

  return (
    <>
      <div className="flex justify-center mb-4 flex-col items-center">
        <input
          type="text"
          placeholder="Buscar Operación..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[220px] p-2 mb-8 border border-gray-300 rounded font-semibold placeholder-mediumBlue placeholder-italic"
        />
        <p className="text-[20px] xl:text-[20px] 2xl:text-[22px] text-center font-semibold">
          Busca la operacion sobre la que queres información
        </p>
      </div>
      {searchedOperations.length > 0 && (
        <Slider {...settings}>
          {searchedOperations.map((operacion: Operation) => (
            <div key={operacion.id} className="px-0 py-4">
              <div className="bg-lightBlue text-white p-4 rounded-xl shadow-md flex justify-center space-x-4 h-[400px] max-h-[400px] md:h-[300px] md:max-h-[300px]">
                <div className="space-y-2 sm:space-y-4 flex flex-col justify-around">
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
                    <strong>Puntas:</strong>{' '}
                    {formatNumber(
                      Number(operacion.punta_vendedora) +
                        Number(operacion.punta_compradora)
                    )}
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-4 flex flex-col justify-around">
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
                      className="text-lightPink hover:text-lightGreen transition duration-150 ease-in-out text-sm font-semibold"
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
                        operacion.estado === 'En Curso'
                          ? `bg-mediumBlue`
                          : `bg-darkBlue`
                      }`}
                    >
                      <span
                        className={`${
                          operacion.estado === 'En Curso'
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        } inline-block w-4 h-4 transform bg-white rounded-full transition duration-150 ease-in-out`}
                      >
                        {operacion.estado === 'En Curso' ? (
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
    </>
  );
};

export default OperationsCarousel;
