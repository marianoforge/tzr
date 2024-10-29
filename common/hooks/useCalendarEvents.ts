import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { fetchUserEvents } from '@/lib/api/eventsApi';
import { Event } from '@/common/types/';

export const useCalendarEvents = () => {
  const { userID } = useAuthStore();

  const {
    data: events = [],
    isLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ['events', userID],
    queryFn: () => fetchUserEvents(userID as string),
    enabled: !!userID,
  });

  const mapEventToCalendarEvent = (event: Event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    startTime: new Date(`${event.date}T${event.startTime}`),
    endTime: new Date(`${event.date}T${event.endTime}`),
    description: event.description,
    user_uid: event.user_uid,
  });

  const calendarEvents = useMemo(
    () => events.map(mapEventToCalendarEvent),
    [events]
  );

  return { calendarEvents, isLoading, eventsError };
};
