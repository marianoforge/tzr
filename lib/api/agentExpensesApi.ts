import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export const fetchAgentExpenses = async (ids: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.get(
    `/api/teamMembers/${ids}/expenses?ids=${ids}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.usersWithExpenses;
};
