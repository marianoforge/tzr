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
  CAIDA = 'Caída',
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
  FONDO_DE_COMERCIO = 'Fondo de Comercio',
  DESARROLLO = 'Desarrollo',
  LOTEAMIENTO = 'Loteamiento',
  LOTES_PARA_DESARROLLOS = 'Lotes Para Desarrollos',
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
  EXPENSES_AGENTS = 'expensesAgents',
  OPERATIONS = 'operations',
  EVENTS = 'events',
  SUBSCRIPTION_DATA = 'subscriptionData',
  USER_DATA = 'userData',
}

export enum UserRole {
  TEAM_LEADER_BROKER = 'team_leader_broker',
  AGENTE_ASESOR = 'agente_asesor',
  DEFAULT = '',
}

export enum OperationData {
  VALOR_RESERVA = 'valor_reserva',
  REALIZADOR_VENTA = 'realizador_venta',
  PORCENTAJE_HONORARIOS_ASESOR = 'porcentaje_honorarios_asesor',
  PORCENTAJE_HONORARIOS_BROKER = 'porcentaje_honorarios_broker',
  HONORARIOS_ASESOR = 'honorarios_asesor',
  HONORARIOS_BROKER = 'honorarios_broker',
  HONORARIOS_TEAM_LEADER = 'honorarios_team_leader',
  PORCENTAJE_PUNTA_COMPRADORA = 'porcentaje_punta_compradora',
  PORCENTAJE_PUNTA_VENDEDORA = 'porcentaje_punta_vendedora',
}

export enum YearFilter {
  DOS_MIL_VEINTITRES = 2023,
  DOS_MIL_VEINTICUATRO = 2024,
  DOS_MIL_VEINTICINCO = 2025,
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
  EXPENSES_AGENTS_LIST = '/expensesAgentsList',
  AGENTS = '/agents',
  EXPENSES_BROKER = '/expensesBroker',
  EXPENSES_AGENTS_FORM = '/expensesAgentsForm',
  PROJECTIONS = '/projections',
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
  PUBLICIDAD = 'Publicidad',
  VARIOS = 'Varios',
  CONTADOR = 'Contador',
  SUELDOS_EMPLEADOS = 'Sueldos Empleados',
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

export enum TipodeVentas {
  CASA = 'Casa',
  PH = 'PH',
  DEPARTAMENTOS = 'Departamentos',
  LOCALES_COMERCIALES = 'Locales Comerciales',
  OFICINAS = 'Oficinas',
  NAVE_INDUSTRIAL = 'Naves Industriales',
  TERRENOS = 'Terrenos',
  CHACRAS = 'Chacras',
  OTRO = 'Otro',
}
