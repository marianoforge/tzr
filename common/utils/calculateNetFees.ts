import { Operation, UserData } from '@/common/types';
import { UserRole } from '@/common/enums';
import { totalHonorariosTeamLead } from '@/common/utils/calculations';

export const calculateNetFees = async (
  operation: Operation,
  userData: UserData
) => {
  // Espera hasta que el rol esté disponible
  while (!userData.role) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Espera 100ms antes de volver a verificar
  }
  if (!userData.role) {
    throw new Error('User role is required');
  }
  const userRole = userData.role as UserRole;
  return totalHonorariosTeamLead(operation, userRole, userData);
};
