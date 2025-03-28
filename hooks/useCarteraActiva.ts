import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Operation {
  id: string;
  direccion: string;
  valor_operacion?: number;
  porcentaje_venta?: number;
  exclusiva: boolean;
  estado: string;
  // Otros campos que pueda tener una operación
}

export interface CarteraActivaItem {
  direccion: string;
  valorOperacion: number;
  porcentajeVenta: number;
  valorActivo: number;
}

export const useCarteraActiva = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<
    CarteraActivaItem[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOperations = async () => {
      setIsLoading(true);
      try {
        // Obtener el token de autenticación (asumiendo que está almacenado en localStorage)
        const token = localStorage.getItem('authToken');

        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('/api/operations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOperations(response.data);

        // Filtrar operaciones exclusivas y en curso
        const exclusiveActiveOps = response.data.filter(
          (op: Operation) => op.exclusiva === true && op.estado === 'En Curso'
        );

        // Mapear a formato de CarteraActivaItem
        const mappedData = exclusiveActiveOps.map((op: Operation) => ({
          direccion: op.direccion || 'Sin dirección',
          valorOperacion: op.valor_operacion || 0,
          porcentajeVenta: op.porcentaje_venta || 3, // Valor por defecto 3% como en el ejemplo
          valorActivo: calculateActivoValue(
            op.valor_operacion || 0,
            op.porcentaje_venta || 3
          ),
        }));

        setFilteredOperations(mappedData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('An unknown error occurred')
        );
        console.error('Error fetching operations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperations();
  }, []);

  // Función para calcular el valor activo basado en el valor de operación y el porcentaje
  const calculateActivoValue = (
    valorOperacion: number,
    porcentajeVenta: number
  ): number => {
    return (valorOperacion * porcentajeVenta) / 100;
  };

  return {
    allOperations: operations,
    exclusiveActiveOperations: filteredOperations,
    isLoading,
    error,
    totalValorOperacion: filteredOperations.reduce(
      (sum, item) => sum + item.valorOperacion,
      0
    ),
    totalPorcentajeVenta: filteredOperations.reduce(
      (sum, item) => sum + item.porcentajeVenta,
      0
    ),
    totalValorActivo: filteredOperations.reduce(
      (sum, item) => sum + item.valorActivo,
      0
    ),
  };
};
