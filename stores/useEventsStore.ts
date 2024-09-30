import { create } from "zustand";
import axios from "axios";

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  user_uid: string;
}

interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: (userID: string) => Promise<void>;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  isLoading: false,
  error: null,
  fetchEvents: async (userID: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/events/user/${userID}`);

      const fetchedEvents: Event[] = response.data;

      // Filtrar eventos pasados y ordenar por fecha
      const filteredAndSortedEvents = fetchedEvents
        .filter((event) => new Date(event.date) >= new Date())
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      set({ events: filteredAndSortedEvents, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
