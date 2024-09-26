export interface Operacion {
  punta_compradora: number;
  punta_vendedora: number;
  id: string;
  fecha_operacion: string;
  direccion_reserva: string;
  tipo_operacion: string;
  valor_reserva: number;
  numero_sobre_reserva: number;
  numero_sobre_refuerzo: number;
  porcentaje_honorarios_asesor: number;
  porcentaje_honorarios_broker: number;
  honorarios_broker: number;
  honorarios_asesor: number;
  referido: string;
  compartido: string;
  estado: string;
}

export interface OperationsListProps {
  userId: string;
}

export interface OperationsState {
  operations: Operacion[];
  totals: {
    valor_reserva: number | string;
    porcentaje_honorarios_asesor: number | string;
    porcentaje_honorarios_broker: number | string; // Added this field
    honorarios_broker: number | string;
    honorarios_asesor: number | string;
    mayor_venta_efectuada: number | string;
    promedio_valor_reserva: number | string;
    punta_compradora: number | string;
    punta_vendedora: number | string;
    suma_total_de_puntas: number | string;
    cantidad_operaciones: number | string;
  };
  isLoading: boolean;
  setOperations: (operations: Operacion[]) => void;
  calculateTotals: () => void;
  setIsLoading: (isLoading: boolean) => void;
}
