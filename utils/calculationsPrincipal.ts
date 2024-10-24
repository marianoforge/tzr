import { Operation } from "@/types";

export const calculateOperationData = (closedOperations: Operation[]) => {
  return closedOperations.reduce(
    (
      acc: Record<
        string,
        { cantidad: number; totalHonorarios: number; totalVenta: number }
      >,
      op: Operation
    ) => {
      if (!acc[op.tipo_operacion]) {
        acc[op.tipo_operacion] = {
          cantidad: 0,
          totalHonorarios: 0,
          totalVenta: 0,
        };
      }
      acc[op.tipo_operacion].cantidad += 1;
      acc[op.tipo_operacion].totalHonorarios += Number(op.honorarios_asesor);
      acc[op.tipo_operacion].totalVenta += Number(op.valor_reserva);
      return acc;
    },
    {} as Record<
      string,
      { cantidad: number; totalHonorarios: number; totalVenta: number }
    >
  );
};

export const calculateTotalCantidad = (
  operationData: Record<string, { cantidad: number }>
) => {
  return Object.values(operationData).reduce(
    (acc, data) => acc + data.cantidad,
    0
  );
};

export const calculateTotalLastColumnSum = (
  operationData: Record<string, { totalVenta: number; cantidad: number }>
) => {
  return Object.entries(operationData).reduce((acc, [tipo, data]) => {
    if (
      ![
        "Alquiler",
        "Cochera",
        "Alquiler Temporal",
        "Alquiler Tradicional",
      ].includes(tipo)
    ) {
      return acc + data.totalVenta / data.cantidad;
    }
    return acc;
  }, 0);
};

export const calculatePercentage = (part: number, total: number) =>
  ((part / total) * 100).toFixed(2);
