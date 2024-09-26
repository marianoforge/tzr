export interface Operacion {
  id: string;
  fecha_operacion: string;
  direccion_reserva: string;
  tipo_operacion: string;
  valor_reserva: number;
  numero_sobre_reserva: number;
  numero_sobre_refuerzo: number;
  porcentaje_honorarios_asesor: number;
  honorarios_brutos: number;
  referido: string;
  compartido: string;
  valor_neto: number;
  estado: string;
}

export interface OperationsListProps {
  userId: string;
}
