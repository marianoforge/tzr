import { months } from "@/lib/data";

export const formatOperationsData = (
  operations: {
    fecha_operacion: string | number | Date;
    valor_neto: number;
  }[]
) => {
  // Aquí debes ajustar la lógica para calcular `currentYear` y `previousYear` según tus datos

  // Generar un objeto base para cada mes con valores iniciales en 0
  const data = months.map((month) => ({
    month,
    currentYear: 0,
    previousYear: 0,
  }));

  // Rellenar los datos de currentYear y previousYear
  operations.forEach(
    (operation: {
      fecha_operacion: string | number | Date;
      valor_neto: number;
    }) => {
      const operationDate = new Date(operation.fecha_operacion);
      const monthIndex = operationDate.getMonth(); // Devuelve un índice de 0 a 11

      // Verifica si la operación es del año actual o del año anterior
      const currentYear = new Date().getFullYear();
      if (operationDate.getFullYear() === currentYear) {
        data[monthIndex].currentYear += operation.valor_neto; // Suma los valores netos del año actual
      } else if (operationDate.getFullYear() === currentYear - 1) {
        data[monthIndex].previousYear += operation.valor_neto; // Suma los valores netos del año anterior
      }
    }
  );

  return data;
};
