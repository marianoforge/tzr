import axios from 'axios';

import { Operation } from '@/common/types/';

export const createOperation = async (operationData: Operation) => {
  const response = await axios.post('/api/operations', operationData);
  return response.data;
};

export const fetchUserOperations = async (userUID: string) => {
  const response = await axios.get(`/api/operations?user_uid=${userUID}`);
  return response.data;
};

export const updateOperation = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Operation>;
}) => {
  const response = await axios.put(`/api/operations/${id}`, data);
  return response.data;
};

export const deleteOperation = async (id: string) => {
  const response = await axios.delete(`/api/operations/${id}`);
  return response.data;
};
