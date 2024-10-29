import axios from 'axios';

import { Event, EventFormData } from '@/common/types/';

export const createEvent = async (eventData: EventFormData) => {
  const response = await axios.post('/api/events', eventData);
  return response.data;
};

export const fetchUserEvents = async (userUID: string) => {
  const response = await axios.get(`/api/events?user_uid=${userUID}`);
  return response.data;
};

export const deleteEvent = async (id: string) => {
  const response = await axios.delete(`/api/events/${id}`);
  return response.data;
};

export const updateEvent = async (event: Event) => {
  const response = await axios.put(`/api/events/${event.id}`, event);
  return response.data;
};
