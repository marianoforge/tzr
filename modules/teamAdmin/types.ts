import { Operation } from '@/common/types';

// Team Member interface
export interface TeamMember {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  email?: string;
  numeroTelefono?: string;
  advisorUid?: string; // UID del asesor correspondiente en la colección usuarios
}

// Summary for each type of operation
export interface OperationSummary {
  tipo: string;
  totalValue: number;
  averagePuntas: number;
  totalGrossFees: number;
  totalNetFees: number;
  exclusivityPercentage: number;
  operationsCount: number;
}

// Global summary statistics
export interface GlobalSummary {
  totalGrossFees: number;
  totalNetFees: number;
  totalOperations: number;
  teamMembersCount: number;
}

// Operation Details Modal Props
export interface OperationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation;
}

// Filter Props
export interface FilterProps {
  yearFilter: string;
  setYearFilter: (value: string) => void;
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

// Team Member Section Props
export interface TeamMemberSectionProps {
  agentId: string;
  operations: Operation[];
  teamMembers: TeamMember[];
  expandedAgents: Record<string, boolean>;
  currentPage: Record<string, number>;
  toggleAgentOperations: (agentId: string) => void;
  handlePageChange: (agentId: string, page: number) => void;
  openOperationDetails: (operation: Operation) => void;
}

// Operation Summary Table Props
export interface OperationSummaryTableProps {
  operationsSummaries: OperationSummary[];
}

// Operation Details Table Props
export interface OperationDetailsTableProps {
  operations: Operation[];
  currentPageIndex: number;
  totalPages: number;
  agentId: string;
  handlePageChange: (agentId: string, page: number) => void;
  openOperationDetails: (operation: Operation) => void;
  getAgentName: (agentId: string) => string;
}
