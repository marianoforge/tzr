import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchUserOperations } from '@/lib/api/operationsApi';
import { QueryKeys, ALQUILER } from '@/common/enums';
import { Operation } from '@/common/types';

export interface CarteraActivaItem {
  direccion: string;
  valorOperacion: number;
  porcentajeVenta: number;
  valorActivo: number;
}

// Función para calcular el valor activo basado en el valor de operación y el porcentaje
const calculateActivoValue = (
  valorOperacion: number,
  porcentajeVenta: number
): number => {
  return (valorOperacion * porcentajeVenta) / 100;
};

export const useCarteraActiva = (userUID: string | null) => {
  const {
    data: operations = [],
    isLoading,
    error: operationsError,
    isSuccess,
  } = useQuery({
    queryKey: [QueryKeys.OPERATIONS, userUID],
    queryFn: () => fetchUserOperations(userUID || ''),
    enabled: !!userUID,
  });

  // Filtrar operaciones exclusivas, en curso y que no sean alquileres
  const exclusiveActiveOperations = useMemo(() => {
    if (!operations || operations.length === 0) return [];

    const filteredOperations = operations.filter(
      (op: Operation) =>
        op.exclusiva === true &&
        op.estado === 'En Curso' &&
        !op.tipo_operacion.startsWith(ALQUILER.ALQUILER) // Excluir alquileres
    );

    // Mapear a formato de CarteraActivaItem
    return filteredOperations.map((op: Operation) => ({
      direccion: op.direccion_reserva || 'Sin dirección',
      valorOperacion: op.valor_reserva || 0,
      porcentajeVenta: op.porcentaje_punta_vendedora || 3, // Valor por defecto 3% como en el ejemplo
      valorActivo: calculateActivoValue(
        op.valor_reserva || 0,
        op.porcentaje_punta_vendedora || 3
      ),
    }));
  }, [operations]);

  // Obtener las operaciones filtradas originales (sin mapear)
  const filteredOperationsOriginal = useMemo(() => {
    if (!operations || operations.length === 0) return [];

    return operations.filter(
      (op: Operation) =>
        op.exclusiva === true &&
        op.estado === 'En Curso' &&
        !op.tipo_operacion.startsWith(ALQUILER.ALQUILER)
    );
  }, [operations]);

  // Calcular totales
  const totalValorOperacion = useMemo(() => {
    return exclusiveActiveOperations.reduce(
      (sum: number, item: CarteraActivaItem) => sum + item.valorOperacion,
      0
    );
  }, [exclusiveActiveOperations]);

  const totalPorcentajeVenta = useMemo(() => {
    return exclusiveActiveOperations.reduce(
      (sum: number, item: CarteraActivaItem) => sum + item.porcentajeVenta,
      0
    );
  }, [exclusiveActiveOperations]);

  const totalValorActivo = useMemo(() => {
    return exclusiveActiveOperations.reduce(
      (sum: number, item: CarteraActivaItem) => sum + item.valorActivo,
      0
    );
  }, [exclusiveActiveOperations]);

  return {
    allOperations: operations,
    exclusiveActiveOperations,
    filteredOperationsOriginal,
    isLoading,
    operationsError,
    isSuccess,
    totalValorOperacion,
    totalPorcentajeVenta,
    totalValorActivo,
  };
};
