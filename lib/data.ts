import { OperationStatus, OperationType, TipodeVentas } from '@/common/enums';

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
  { value: 'Publicidad', label: 'Publicidad' },
  { value: 'Varios', label: 'Varios' },
  { value: 'Contador', label: 'Contador' },
  { value: 'Sueldos Empleados', label: 'Sueldos Empleados' },
  { value: 'Matrícula', label: 'Matricula' },
  { value: 'ABAO', label: 'ABAO' },
  { value: 'Fianza', label: 'Fianza' },
  { value: 'Alquiler Oficina', label: 'Alquiler Oficina' },
  { value: 'Portales Inmobiliarios', label: 'Portales Inmobiliarios' },
  { value: 'CRM', label: 'CRM' },
  { value: 'Viáticos', label: 'Viáticos' },
  { value: 'Expensas', label: 'Expensas' },
  { value: 'Servicios de Oficina', label: 'Servicios de Oficina' },
  { value: 'Caja Chica', label: 'Caja Chica' },
  { value: 'Otros', label: 'Otros' },
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
  { value: OperationType.LOTEAMIENTO, label: 'Loteamiento' },
  {
    value: OperationType.LOTES_PARA_DESARROLLOS,
    label: 'Lotes Para Desarrollos',
  },
];

export const propertyTypes = [
  { value: '', label: 'Selecciona el Tipo de Inmueble' },
  { value: TipodeVentas.CASA, label: 'Casa' },
  { value: TipodeVentas.PH, label: 'PH' },
  { value: TipodeVentas.DEPARTAMENTOS, label: 'Departamentos' },
  { value: TipodeVentas.LOCALES_COMERCIALES, label: 'Locales Comerciales' },
  { value: TipodeVentas.OFICINAS, label: 'Oficinas' },
  { value: TipodeVentas.NAVE_INDUSTRIAL, label: 'Naves Industriales' },
  { value: TipodeVentas.TERRENOS, label: 'Terrenos' },
  { value: TipodeVentas.CHACRAS, label: 'Chacras' },
  { value: TipodeVentas.OTRO, label: 'Otro' },
];

export const yearsFilter = [
  { value: 'all', label: 'Todos los años' },
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
  { value: OperationStatus.CAIDA, label: 'Operaciones Caídas' },
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
  { value: OperationType.LOTEAMIENTO, label: 'Loteamiento' },
  {
    value: OperationType.LOTES_PARA_DESARROLLOS,
    label: 'Lotes Para Desarrollos',
  },
];

export const operationVentasTypeFilterRent = [
  { value: 'all', label: 'Tipo de la Op.' },
  { value: OperationType.ALQUILER_TRADICIONAL, label: 'Alquiler Tradicional' },
  { value: OperationType.ALQUILER_TEMPORAL, label: 'Alquiler Temporal' },
  { value: OperationType.ALQUILER_COMERCIAL, label: 'Alquiler Comercial' },
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

export const PRICE_ID_STARTER = 'price_1Qn5iDLhJiHtNGWdsVzCqlFu';
// export const PRICE_ID_STARTER = 'price_1Qn6Q8LhJiHtNGWduNjGOhSh';
export const PRICE_ID_STARTER_ANNUAL = 'price_1Qn5iDLhJiHtNGWd3msRL7uN';
export const PRICE_ID_GROWTH = 'price_1Qn5lOLhJiHtNGWdBb9xAuEG';
export const PRICE_ID_GROWTH_ANNUAL = 'price_1R1WyqLhJiHtNGWdD45qBTqH';
export const PRICE_ID_ENTERPRISE = '';
