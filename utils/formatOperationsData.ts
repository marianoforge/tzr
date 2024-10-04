import { months } from "@/lib/data";

export const formatOperationsData = (
  operations: {
    fecha_operacion: string | number | Date;
    valor_neto: number;
  }[]
) => {
  const data = months.map((month) => ({
    month,
    currentYear: 0,
    previousYear: 0,
  }));

  operations.forEach(
    (operation: {
      fecha_operacion: string | number | Date;
      valor_neto: number;
    }) => {
      const operationDate = new Date(operation.fecha_operacion);
      const monthIndex = operationDate.getMonth();

      const currentYear = new Date().getFullYear();
      if (operationDate.getFullYear() === currentYear) {
        data[monthIndex].currentYear += operation.valor_neto;
      } else if (operationDate.getFullYear() === currentYear - 1) {
        data[monthIndex].previousYear += operation.valor_neto;
      }
    }
  );

  return data;
};
