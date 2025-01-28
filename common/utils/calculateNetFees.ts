import { Operation, UserData } from '@/common/types';
import { UserRole } from '@/common/enums';
import { totalHonorariosTeamLead } from '@/common/utils/calculations';

export const calculateNetFees = (
  operation: Operation,
  userData: UserData | null
): number => {
  if (!userData) {
    console.warn('User data is missing. Using default values.');
    return 0; // Return a default fee of 0 if userData is null
  }

  const userRole = userData.role ?? UserRole.DEFAULT; // Fallback to 'guest' if role is null
  return totalHonorariosTeamLead(operation, userRole as UserRole, userData);
};
