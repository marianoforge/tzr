import { Operation, UserData } from '@/common/types';
import { UserRole } from '@/common/enums';
import { totalHonorariosTeamLead } from '@/common/utils/calculations';

export const calculateNetFees = (operation: Operation, userData: UserData) => {
  return totalHonorariosTeamLead(
    operation,
    userData.role as UserRole,
    userData
  );
};
