import axios from 'axios';

import { Event } from '@/types';
import { EventFormData } from '@/components/TrackerComponents/Events/FormularioEvento';

// Crear un nuevo evento
export const createEvent = async (eventData: EventFormData) => {
  const response = await axios.post('/api/events', eventData);
  return response.data;
};

// Obtener eventos de un usuario
export const fetchUserEvents = async (userUID: string) => {
  const response = await axios.get(`/api/events?user_uid=${userUID}`);
  return response.data;
};

// Eliminar un evento por ID
export const deleteEvent = async (id: string) => {
  const response = await axios.delete(`/api/events/${id}`);
  return response.data;
};

// Actualizar un evento
export const updateEvent = async (event: Event) => {
  const response = await axios.put(`/api/events/${event.id}`, event);
  return response.data;
};
