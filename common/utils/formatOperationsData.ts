import { months } from '@/lib/data';

import { OperationData } from '../enums';

export const formatOperationsData = (
  operations: {
    fecha_operacion: string | number | Date;
    honorarios_asesor?: number;
    honorarios_broker?: number;
  }[],
  field: OperationData.HONORARIOS_ASESOR | OperationData.HONORARIOS_BROKER
) => {
  // Inicializamos el array con los meses y valores en 0
  const data = months.map((month) => ({
    month,
    currentYear: 0,
    previousYear: 0,
  }));

  operations.forEach(
    (operation: {
      fecha_operacion: string | number | Date;
      honorarios_asesor?: number;
      honorarios_broker?: number;
    }) => {
      const operationDate = new Date(operation.fecha_operacion);
      const monthIndex = operationDate.getMonth();
      const currentYear = new Date().getFullYear();

      // Verificamos que el campo especificado sea un número válido y limitamos a 2 decimales
      const honorarios = isNaN(Number(operation[field]))
        ? 0
        : parseFloat(Number(operation[field]).toFixed(2));

      if (operationDate.getFullYear() === currentYear) {
        // Sumamos los honorarios del año actual con 2 decimales
        data[monthIndex].currentYear += honorarios;
      } else if (operationDate.getFullYear() === currentYear - 1) {
        // Sumamos los honorarios del año anterior con 2 decimales
        data[monthIndex].previousYear += honorarios;
      }
    }
  );

  // Formateamos los valores finales a 2 decimales también
  return data.map((item) => ({
    ...item,
    currentYear: parseFloat(item.currentYear.toFixed(2)),
    previousYear: parseFloat(item.previousYear.toFixed(2)),
  }));
};
