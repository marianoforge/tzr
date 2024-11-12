import { OperationStatus, OperationType } from '@/common/enums';

export const months = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export const expenseTypes = [
  { value: 'all', label: 'Todos los Gastos' },
  { value: 'Fee (Franquicia)', label: 'Fee (Franquicia)' },
  { value: 'Carteleria', label: 'Carteleria' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Varios', label: 'Varios' },
  { value: 'Contador', label: 'Contador' },
  { value: 'Matrícula', label: 'Matricula' },
  { value: 'ABAO', label: 'ABAO' },
  { value: 'Fianza', label: 'Fianza' },
  { value: 'Alquiler Oficina', label: 'Alquiler Oficina' },
  { value: 'Portales Inmobiliarios', label: 'Portales Inmobiliarios' },
  { value: 'CRM', label: 'CRM' },
  { value: 'Viáticos', label: 'Viáticos' },
  { value: 'Expensas', label: 'Expensas' },
  { value: 'Servicios de Oficina', label: 'Servicios de Oficina' },
  { value: 'Otros', label: 'Otros' },
];

export const provincias = [
  { value: 'Buenos Aires', label: 'Buenos Aires' },
  { value: 'CABA', label: 'CABA' },
  { value: 'Catamarca', label: 'Catamarca' },
  { value: 'Chaco', label: 'Chaco' },
  { value: 'Chubut', label: 'Chubut' },
  { value: 'Córdoba', label: 'Córdoba' },
  { value: 'Corrientes', label: 'Corrientes' },
  { value: 'Entre Ríos', label: 'Entre Ríos' },
  { value: 'Formosa', label: 'Formosa' },
  { value: 'Jujuy', label: 'Jujuy' },
  { value: 'La Pampa', label: 'La Pampa' },
  { value: 'La Rioja', label: 'La Rioja' },
  { value: 'Mendoza', label: 'Mendoza' },
  { value: 'Misiones', label: 'Misiones' },
  { value: 'Neuquén', label: 'Neuquén' },
  { value: 'Río Negro', label: 'Río Negro' },
  { value: 'Salta', label: 'Salta' },
  { value: 'San Juan', label: 'San Juan' },
  { value: 'San Luis', label: 'San Luis' },
  { value: 'Santa Cruz', label: 'Santa Cruz' },
  { value: 'Santa Fe', label: 'Santa Fe' },
  { value: 'Santiago del Estero', label: 'Santiago del Estero' },
  { value: 'Tierra del Fuego', label: 'Tierra del Fuego' },
  { value: 'Tucumán', label: 'Tucumán' },
];

export const operationTypes = [
  { value: '', label: 'Selecciona el Tipo de Operación' },
  { value: OperationType.VENTA, label: 'Venta' },
  { value: OperationType.ALQUILER_TEMPORAL, label: 'Alquiler Temporal' },
  { value: OperationType.ALQUILER_TRADICIONAL, label: 'Alquiler Tradicional' },
  { value: OperationType.ALQUILER_COMERCIAL, label: 'Alquiler Comercial' },
  { value: OperationType.FONDO_DE_COMERCIO, label: 'Fondo de Comercio' },
  {
    value: OperationType.DESARROLLO_INMOBILIARIO,
    label: 'Desarrollo Inmobiliario',
  },
  { value: OperationType.COCHERA, label: 'Cochera' },
  { value: OperationType.LOCALES_COMERCIALES, label: 'Locales Comerciales' },
  { value: OperationType.LOTEAMIENTO, label: 'Loteamiento' },
  { value: OperationType.NAVES_INDUSTRIALES, label: 'Naves Industriales' },
  {
    value: OperationType.LOTES_PARA_DESARROLLOS,
    label: 'Lotes Para Desarrollos',
  },
];

export const yearsFilter = [
  {
    value: new Date().getFullYear().toString(),
    label: new Date().getFullYear().toString(),
  },
  {
    value: (new Date().getFullYear() - 1).toString(),
    label: (new Date().getFullYear() - 1).toString(),
  },
];

export const statusOptions = [
  { value: 'all', label: 'Estado de la Op.' },
  { value: OperationStatus.EN_CURSO, label: 'En Curso / Reservas' },
  { value: OperationStatus.CERRADA, label: 'Operaciones Cerradas' },
];

export const operationVentasTypeFilter = [
  { value: 'all', label: 'Tipo de la Op.' },
  { value: OperationType.VENTA, label: 'Venta' },
  { value: OperationType.FONDO_DE_COMERCIO, label: 'Fondo de Comercio' },
  {
    value: OperationType.DESARROLLO_INMOBILIARIO,
    label: 'Desarrollo Inmobiliario',
  },
  { value: OperationType.COCHERA, label: 'Cochera' },
  { value: OperationType.LOCALES_COMERCIALES, label: 'Locales Comerciales' },
  { value: OperationType.LOTEAMIENTO, label: 'Loteamiento' },
  { value: OperationType.NAVES_INDUSTRIALES, label: 'Naves Industriales' },
  {
    value: OperationType.LOTES_PARA_DESARROLLOS,
    label: 'Lotes Para Desarrollos',
  },
];

export const monthsFilter = [
  { value: 'all', label: 'Todos los Meses' },
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export const operationTypeRentFilter = [
  { value: 'all', label: 'Todos los Tipos' },
  { value: OperationType.ALQUILER_TRADICIONAL, label: 'Alquiler Tradicional' },
  { value: OperationType.ALQUILER_TEMPORAL, label: 'Alquiler Temporal' },
  { value: OperationType.ALQUILER_COMERCIAL, label: 'Alquiler Comercial' },
];

export const provinciasArgentinas = [
  { value: '', label: 'Selecciona la Provincia' },
  { value: 'Buenos Aires', label: 'Buenos Aires' },
  { value: 'CABA', label: 'CABA' },
  { value: 'Catamarca', label: 'Catamarca' },
  { value: 'Chaco', label: 'Chaco' },
  { value: 'Chubut', label: 'Chubut' },
  { value: 'Córdoba', label: 'Córdoba' },
  { value: 'Corrientes', label: 'Corrientes' },
  { value: 'Entre Ríos', label: 'Entre Ríos' },
  { value: 'Formosa', label: 'Formosa' },
  { value: 'Jujuy', label: 'Jujuy' },
  { value: 'La Pampa', label: 'La Pampa' },
  { value: 'La Rioja', label: 'La Rioja' },
  { value: 'Mendoza', label: 'Mendoza' },
  { value: 'Misiones', label: 'Misiones' },
  { value: 'Neuquén', label: 'Neuquén' },
  { value: 'Río Negro', label: 'Río Negro' },
  { value: 'Salta', label: 'Salta' },
  { value: 'San Juan', label: 'San Juan' },
  { value: 'San Luis', label: 'San Luis' },
  { value: 'Santa Cruz', label: 'Santa Cruz' },
  { value: 'Santa Fe', label: 'Santa Fe' },
  { value: 'Santiago del Estero', label: 'Santiago del Estero' },
  { value: 'Tierra del Fuego', label: 'Tierra del Fuego' },
  { value: 'Tucumán', label: 'Tucumán' },
];

export const PRICE_ID_STARTER = 'price_1QAASbJkIrtwQiz3PcJiJebj';
export const PRICE_ID_GROWTH = 'price_1QAAT6JkIrtwQiz3J0HLDRTQ';
export const PRICE_ID_ENTERPRISE = 'price_1QAAT6JkIrtwQiz3J0HLDRTQ';
