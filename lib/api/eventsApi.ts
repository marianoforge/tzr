import axios from 'axios';

import { Event, EventFormData } from '@/common/types/';
import { useAuthStore } from '@/stores/authStore';

const getToken = async (): Promise<string> => {
  const token = await useAuthStore.getState().getAuthToken();
  if (!token) throw new Error('User not authenticated');
  return token;
};

export const createEvent = async (eventData: EventFormData) => {
  const token = await getToken();
  const response = await axios.post('/api/events', eventData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchUserEvents = async (userUID: string) => {
  const token = await getToken();
  const response = await axios.get(`/api/events?user_uid=${userUID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteEvent = async (id: string) => {
  const token = await getToken();
  const response = await axios.delete(`/api/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateEvent = async (event: Event) => {
  const token = await getToken();
  const response = await axios.put(`/api/events/${event.id}`, event, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
