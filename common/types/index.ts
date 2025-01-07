interface BaseState<T> {
  isLoading: boolean;
  error: string | null;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchItems: (userID: string) => Promise<void>;
  setItems: (items: T[]) => void;
}

export interface Operation {
  punta_compradora: boolean;
  punta_vendedora: boolean;
  id: string;
  fecha_operacion: string;
  direccion_reserva: string;
  localidad_reserva: string;
  provincia_reserva: string;
  pais: string;
  numero_casa: string;
  tipo_operacion: string;
  valor_reserva: number;
  numero_sobre_reserva?: string | null;
  numero_sobre_refuerzo?: string | null;
  monto_sobre_reserva?: number | null;
  monto_sobre_refuerzo?: number | null;
  porcentaje_honorarios_asesor: number;
  porcentaje_honorarios_broker: number;
  porcentaje_punta_compradora: number;
  porcentaje_punta_vendedora: number;
  porcentaje_compartido?: number | null;
  porcentaje_referido?: number | null;
  honorarios_broker: number;
  honorarios_asesor: number;
  referido?: string | null;
  compartido?: string | null;
  realizador_venta: string;
  realizador_venta_adicional?: string | null;
  porcentaje_honorarios_asesor_adicional?: number | null;
  estado: string;
  user_uid: string;
  user_uid_adicional?: string | null;
  teamId: string;
  observaciones?: string | null;
}

export interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface Event {
  id?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  address: string;
  user_uid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventsState extends BaseState<Event> {
  events: Event[];
  fetchEvents: (userID: string) => Promise<void>;
}

export interface Expense {
  id?: string;
  date: string;
  amount: number;
  amountInDollars: number;
  expenseType: string;
  description: string;
  dollarRate: number;
  user_uid?: string;
  otherType?: string;
}

export interface ExpenseFormData {
  date: string;
  amount: number;
  amountInDollars?: number;
  expenseType: string;
  description?: string;
  dollarRate: number;
  otherType?: string;
}

export interface ExpenseAgentsFormData {
  date: string;
  amount: number;
  amountInDollars?: number;
  expenseType: string;
  description?: string;
  dollarRate: number;
  otherType?: string;
  teamMember: string;
}

export interface ExpensesState extends BaseState<Expense> {
  expenses: Expense[];
  items: Expense[];
  totals: {
    totalAmount: number;
    totalAmountInDollars: number;
    totalExpenses: number;
    valor_reserva: number;
    suma_total_de_puntas: number;
    honorarios_broker: number;
    honorarios_asesor: number;
  };
  setExpenses: (expenses: Expense[]) => void;
  calculateTotals: () => void;
  updateExpense: (id: string, newData: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  fetchExpenses: (userID: string) => Promise<void>;
  setItems: (items: Expense[]) => void;
  fetchItems: (userID: string) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface UserData {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  numeroTelefono: string | null;
  agenciaBroker: string | null;
  objetivoAnual: number | null;
  role: string | null;
  uid: string | null;
  trialEndsAt: Date | { toDate: () => Date } | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export interface UserDataState extends BaseState<UserData> {
  userData: UserData | null;
  role: string | null;
  items: UserData[];
  setUserData: (userData: UserData | null) => void;
  setUserRole: (role: string | null) => void;
  clearUserData: () => void;
  fetchUserData: (userID: string) => Promise<void>;
}

export interface UserState {
  userID: string | null;
  role: string | null;
  setUserID: (id: string | null) => void;
  setUserRole: (role: string | null) => void;
  initializeAuthListener: () => () => void;
}

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  onAccept?: () => void;
  secondButtonText?: string;
  onSecondButtonClick?: () => void;
  className?: string;
  thirdButtonText?: string;
  onThirdButtonClick?: () => void;
  messageClassName?: string;
}

export interface UserInfoProps {
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  agenciaBroker: string;
  numeroTelefono: string;
  currency: string;
  currencySymbol: string;
}

export interface LoginData {
  email: string;
  password: string;
}
export interface RegisterRequestBody {
  email: string;
  password?: string;
  agenciaBroker: string;
  numeroTelefono: string;
  firstName: string;
  lastName: string;
  role: string;
  googleUser?: boolean;
  uid?: string;
  priceId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  trialEndsAt: string;
  verificationToken: string;
  currency: string;
  currencySymbol: string;
  captchaToken: string;
}

export interface LoginRequestBody {
  email?: string;
  password?: string;
  googleAuth?: boolean;
}

// Define TeamMember utilizando el mismo tipo Operation
export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  numeroTelefono: string;
  operaciones: Operation[]; // Aquí aseguramos que es el mismo tipo Operation[]
}

// Define UserWithOperations si aún no está definido
export interface UserWithOperations {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  agenciaBroker?: string;
  operaciones: Operation[];
}

export interface TeamMemberRequestBody {
  firstName: string;
  lastName: string;
  email?: string | null;
  numeroTelefono?: string | null;
}

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  tooltip?: string;
  onSort?: () => void;
  isSortedAsc?: boolean;
}

export interface SessionType {
  id: string;
  amount_total: number;
  payment_status: string;
  subscription: string;
  customer: string;
  customer_details: {
    email: string;
  };
  line_items?: {
    data: { price: { id: string } }[];
  };
}
