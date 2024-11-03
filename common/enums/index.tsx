export enum CalendarView {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export enum CalendarAction {
  PREV = 'PREV',
  NEXT = 'NEXT',
  TODAY = 'TODAY',
}

export enum OperationStatus {
  TODAS = 'all',
  EN_CURSO = 'En Curso',
  CERRADA = 'Cerrada',
}

export enum ALQUILER {
  ALQUILER = 'Alquiler',
}

export enum OperationType {
  ALL = 'all',
  VENTA = 'Venta',
  ALQUILER_TRADICIONAL = 'Alquiler Tradicional',
  DESARROLLO_INMOBILIARIO = 'Desarrollo Inmobiliario',
  COCHERA = 'Cochera',
  ALQUILER_TEMPORAL = 'Alquiler Temporal',
  ALQUILER_COMERCIAL = 'Alquiler Comercial',
  LOCALES_COMERCIALES = 'Locales Comerciales',
  FONDO_DE_COMERCIO = 'Fondo de Comercio',
  DESARROLLO = 'Desarrollo',
  LOTEAMIENTO = 'Loteamiento',
  NAVES_INDUSTRIALES = 'Naves Industriales',
  LOTES_PARA_DESARROLLOS = 'Lotes Para Desarrollos',
  //   ALQUILER = 'Alquiler',
}

export enum APIMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum QueryKeys {
  TEAM_MEMBERS_OPS = 'teamMembersOps',
  TEAM_MEMBERS = 'teamMembers',
  USERS_WITH_OPERATIONS = 'usersWithOperations',
  EXPENSES = 'expenses',
  OPERATIONS = 'operations',
  EVENTS = 'events',
  SUBSCRIPTION_DATA = 'subscriptionData',
  USER_DATA = 'userData',
}

export enum UserRole {
  TEAM_LEADER_BROKER = 'team_leader_broker',
  AGENTE_ASESOR = 'agente_asesor',
}

export enum OperationData {
  VALOR_RESERVA = 'valor_reserva',
  REALIZADOR_VENTA = 'realizador_venta',
  PORCENTAJE_HONORARIOS_ASESOR = 'porcentaje_honorarios_asesor',
  PORCENTAJE_HONORARIOS_BROKER = 'porcentaje_honorarios_broker',
  HONORARIOS_ASESOR = 'honorarios_asesor',
  HONORARIOS_BROKER = 'honorarios_broker',
  PORCENTAJE_PUNTA_COMPRADORA = 'porcentaje_punta_compradora',
  PORCENTAJE_PUNTA_VENDEDORA = 'porcentaje_punta_vendedora',
}

export enum YearFilter {
  TODOS = 'all',
  DOS_MIL_VEINTITRES = '2023',
  DOS_MIL_VEINTICUATRO = '2024',
}

export enum PATHS {
  LOGIN = '/login',
  REGISTER = '/register',
  RESET_PASSWORD = '/reset-password',
  RESERVATION_INPUT = '/reservationInput',
  DASHBOARD = '/dashboard',
  EVENT_FORM = '/eventForm',
  CALENDAR = '/calendar',
  SETTINGS = '/settings',
  OPERATIONS_LIST = '/operationsList',
  EXPENSES = '/expenses',
  EXPENSES_LIST = '/expensesList',
  AGENTS = '/agents',
  EXPENSES_BROKER = '/expensesBroker',
  NOT_AUTHORIZED = '/not-authorized',
}

export enum MonthNames {
  ENERO = 'Enero',
  FEBRERO = 'Febrero',
  MARZO = 'Marzo',
  ABRIL = 'Abril',
  MAYO = 'Mayo',
  JUNIO = 'Junio',
  JULIO = 'Julio',
  AGOSTO = 'Agosto',
  SEPTIEMBRE = 'Septiembre',
  OCTUBRE = 'Octubre',
  NOVIEMBRE = 'Noviembre',
  DICIEMBRE = 'Diciembre',
}

export enum ExpenseType {
  ALL = 'all',
  FEE_FRANQUICIA = 'Fee (Franquicia)',
  CARTELERIA = 'Carteleria',
  MARKETING = 'Marketing',
  VARIOS = 'Varios',
  CONTADOR = 'Contador',
  MATRICULA = 'Matrícula',
  ABAO = 'ABAO',
  FIANZA = 'Fianza',
  ALQUILER_OFICINA = 'Alquiler Oficina',
  PORTALES_INMOBILIARIOS = 'Portales Inmobiliarios',
  CRM = 'CRM',
  VIATICOS = 'Viaticos',
  EXPENSAS = 'Expensas',
  SERVICIOS_OFICINA = 'Servicios de Oficina',
  OTROS = 'Otros',
}
