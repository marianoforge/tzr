import { create } from "zustand";
import axios from "axios";
import { EventsState, Event } from "@/types";

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  isLoading: false,
  error: null,
  fetchEvents: async (userID: string) => {
    const response = await fetch(`/api/events?userID=${userID}`);
    const events = await response.json();
    set({ events });
  },

  fetchItems: async (userID: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`/api/events/user/${userID}`);

      const fetchedEvents: Event[] = response.data;

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

  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setItems: (items: Event[]) => set({ events: items }),
}));
