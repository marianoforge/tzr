import { Operation, UserData } from '@/common/types';
import { UserRole } from '@/common/enums';
import { totalHonorariosTeamLead } from '@/common/utils/calculations';

export const calculateNetFees = (operation: Operation, userData: UserData) => {
  if (!userData.role) {
    throw new Error('User role is required');
  }
  const userRole = userData.role as UserRole;
  return totalHonorariosTeamLead(operation, userRole, userData);
};
