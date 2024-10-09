import { months } from "@/lib/data";

export const formatOperationsData = (
  operations: {
    fecha_operacion: string | number | Date;
    honorarios_asesor: number;
  }[]
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
      honorarios_asesor: number;
    }) => {
      const operationDate = new Date(operation.fecha_operacion);
      const monthIndex = operationDate.getMonth();
      const currentYear = new Date().getFullYear();

      // Verificamos que honorarios_asesor sea un número válido y limitamos a 2 decimales
      const honorariosAsesor = isNaN(Number(operation.honorarios_asesor))
        ? 0
        : parseFloat(Number(operation.honorarios_asesor).toFixed(2));

      if (operationDate.getFullYear() === currentYear) {
        // Sumamos los honorarios del año actual con 2 decimales
        data[monthIndex].currentYear += honorariosAsesor;
      } else if (operationDate.getFullYear() === currentYear - 1) {
        // Sumamos los honorarios del año anterior con 2 decimales
        data[monthIndex].previousYear += honorariosAsesor;
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
