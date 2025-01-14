import axios from 'axios';

import { Operation } from '@/common/types';

export const fetchUserOperations = async (
  userUID: string
): Promise<Operation[]> => {
  const response = await axios.get(`/api/operations?user_uid=${userUID}`);
  return response.data;
};
