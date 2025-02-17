import axios from 'axios';

import { Operation } from '@/common/types';
import { useAuthStore } from '@/stores/authStore';

export const fetchUserOperations = async (
  userUID: string
): Promise<Operation[]> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.get(`/api/operations?user_uid=${userUID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};
