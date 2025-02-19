// calculationGrossbyMonth.ts
import { Operation } from '@/common/types';

export const calculateGrossByMonth = (
  validOperations: Operation[],
  year: number
) => {
  const validOperationsTotalValorPorMes = validOperations.reduce(
    (acc: Record<number, number>, op: Operation) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || op.fecha_captacion || ''
      );
      const operationYear = operationDate.getFullYear();
      const month = operationDate.getMonth() + 1; // Get month (1-12)

      if (operationYear === year) {
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += Number(op.valor_reserva) || 0;
      }
      return acc;
    },
    {} as Record<number, number>
  );

  const validOperationsTotalHonorariosBrokerPorMes = validOperations.reduce(
    (acc: Record<number, number>, op: Operation) => {
      const operationDate = new Date(
        op.fecha_operacion || op.fecha_reserva || op.fecha_captacion || ''
      );
      const operationYear = operationDate.getFullYear();
      const month = operationDate.getMonth() + 1;

      if (operationYear === year) {
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] +=
          Number((op.valor_reserva * op.porcentaje_honorarios_broker) / 100) ||
          0;
      }
      return acc;
    },
    {} as Record<number, number>
  );

  const porcentajeHonorariosBrokerPorMes = Object.keys(
    validOperationsTotalHonorariosBrokerPorMes
  ).reduce(
    (acc: Record<number, number>, month: string) => {
      const brokerValue =
        validOperationsTotalHonorariosBrokerPorMes[Number(month)] || 0;
      const reservaValue = validOperationsTotalValorPorMes[Number(month)] || 0;
      acc[Number(month)] = reservaValue
        ? parseFloat(((brokerValue * 100) / reservaValue).toFixed(2))
        : 0;
      return acc;
    },
    {} as Record<number, number>
  );

  return porcentajeHonorariosBrokerPorMes;
};
