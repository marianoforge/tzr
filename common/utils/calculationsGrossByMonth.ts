// calculationGrossbyMonth.ts
import { Operation } from '@/common/types';
import { calculateTotalHonorariosBroker } from '@/common/utils/calculations';

export const calculateGrossByMonth = (
  validOperations: Operation[],
  year: number
) => {
  // Agrupamos las operaciones por mes para el año especificado
  const operationsByMonth = validOperations.reduce(
    (acc: Record<number, Operation[]>, op: Operation) => {
      // Usamos EXPLÍCITAMENTE fecha_operacion con fallback a fecha_reserva
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || ''
      );
      const operationYear = operationDate.getFullYear();
      const month = operationDate.getMonth() + 1; // Get month (1-12)

      if (operationYear === year) {
        if (!acc[month]) {
          acc[month] = [];
        }
        acc[month].push(op);
      }
      return acc;
    },
    {} as Record<number, Operation[]>
  );

  // Para cada mes, calculamos el valor total de las operaciones
  const validOperationsTotalValorPorMes = Object.entries(
    operationsByMonth
  ).reduce(
    (acc: Record<number, number>, [month, operations]) => {
      acc[Number(month)] = operations.reduce(
        (sum, op) => sum + (Number(op.valor_reserva) || 0),
        0
      );
      return acc;
    },
    {} as Record<number, number>
  );

  // Para cada mes, calculamos los honorarios brutos - SIN FILTRAR POR ESTADO
  const validOperationsTotalHonorariosBrokerPorMes = Object.entries(
    operationsByMonth
  ).reduce(
    (acc: Record<number, number>, [month, operations]) => {
      // No pasamos el estado como parámetro para evitar filtrados adicionales
      acc[Number(month)] = calculateTotalHonorariosBroker(operations);
      return acc;
    },
    {} as Record<number, number>
  );

  // Calculamos el porcentaje para cada mes
  const porcentajeHonorariosBrokerPorMes = Object.keys(
    validOperationsTotalHonorariosBrokerPorMes
  ).reduce(
    (acc: Record<number, number>, month: string) => {
      const brokerValue =
        validOperationsTotalHonorariosBrokerPorMes[Number(month)] || 0;
      const reservaValue = validOperationsTotalValorPorMes[Number(month)] || 0;

      // Aseguramos que obtenemos máximo 2 decimales
      acc[Number(month)] = reservaValue
        ? Math.round(((brokerValue * 100) / reservaValue) * 100) / 100
        : 0;
      return acc;
    },
    {} as Record<number, number>
  );

  return porcentajeHonorariosBrokerPorMes;
};
