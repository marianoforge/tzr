import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { Operation } from '@/common/types/';

export const createOperation = async (operationData: Operation) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.post('/api/operations', operationData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchUserOperations = async (userUID: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.get(`/api/operations?user_uid=${userUID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateOperation = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Operation>;
}) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.put(`/api/operations/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteOperation = async (id: string) => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');

  const response = await axios.delete(`/api/operations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
